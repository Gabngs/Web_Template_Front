import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { JSEncrypt } from 'jsencrypt';
import { environment } from '../../../environments/environment';
import { IRol } from '@interfaces/models/rol.interface';
import { IPermisosSesion } from '@interfaces/models/permisos-sesion.interface';
import { IUsuarioSesion, ILoginResult } from '@models/sesion.model';
import { TokenStorageService } from '../storage/token-storage.service';
import { PermisoService } from './permiso.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly permiso = inject(PermisoService);
  private readonly apiUrl = environment.apiUrl;
  private readonly endpoints = environment.endpoints.auth;

  readonly usuario = signal<IUsuarioSesion | null>(null);
  readonly rol = signal<IRol | null>(null);

  // true cuando el backend exige cambiar la contraseña (alta con password inicial o reset por un admin)
  // antes de permitir cualquier otra operación — ver ForzarCambioPassword (gsp-back).
  readonly debeCambiarPassword = signal(false);

  // Gating grueso por rol (isSuperUser/isAdmin) — no hay catálogo de permisos aún, ver Flujo de Permisos Frontend.
  readonly esAdmin = computed(() => {
    const slug = this.rol()?.slug;
    return slug === 'isSuperUser' || slug === 'isAdmin';
  });

  get token(): string | null {
    return this.tokenStorage.get();
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  async login(emailOrCodigo: string, plainPassword: string, device: 'web' | 'mobile' | 'tablet' = 'web'): Promise<ILoginResult> {
    // La clave pública y el nonce se piden frescos en cada intento — nunca se reutilizan.
    const { data: keyData } = await firstValueFrom(
      this.http.get<{ data: { public_key: string } }>(`${this.apiUrl}${this.endpoints.publicKey}`)
    );
    const { data: challengeData } = await firstValueFrom(
      this.http.get<{ data: { nonce: string } }>(`${this.apiUrl}${this.endpoints.challenge}`)
    );

    const encryptedPassword = this.encryptWithPublicKey(plainPassword, keyData.public_key);

    const response = await firstValueFrom(
      this.http.post<{
        data: { token: string; debe_cambiar_password: boolean; usuario: IUsuarioSesion };
      }>(`${this.apiUrl}${this.endpoints.login}`, {
        email: emailOrCodigo,
        password: encryptedPassword,
        nonce: challengeData.nonce,
        device,
      })
    );

    const { token, debe_cambiar_password, usuario } = response.data;
    this.tokenStorage.set(token);
    this.usuario.set(usuario);
    this.debeCambiarPassword.set(debe_cambiar_password);

    return { usuario, debeCambiarPassword: debe_cambiar_password };
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}${this.endpoints.logout}`, {}));
    } finally {
      this.limpiarSesionLocal();
    }
  }

  // Invocado por authInterceptor ante un 401 (sesión/token inválido en el backend):
  // a diferencia de logout(), no pega al backend — el token que tendría que
  // autenticar ese POST es justamente el que ya se sabe inválido.
  limpiarSesionLocal(): void {
    this.tokenStorage.clear();
    this.usuario.set(null);
    this.rol.set(null);
    this.debeCambiarPassword.set(false);
  }

  // Invocado por authInterceptor cuando cualquier request cae en el 403 de
  // ForzarCambioPassword (gsp-back) — habilita el dialog modal global.
  forzarCambioPassword(): void {
    this.debeCambiarPassword.set(true);
  }

  // Único request de sesión: trae datos básicos del usuario + rol + permisos +
  // menús en una sola respuesta (AuthController::me() ya fusiona lo que antes
  // eran 3 endpoints — ver AuthService::armarPaqueteSesion() en el backend).
  async me(): Promise<IUsuarioSesion> {
    const response = await firstValueFrom(
      this.http.get<{ data: IUsuarioSesion & IPermisosSesion }>(`${this.apiUrl}${this.endpoints.me}`)
    );
    const { rol, permisos, menus, ...usuario } = response.data;
    this.usuario.set(usuario);
    this.rol.set(rol);
    this.permiso.establecerDesdeSesion(rol, permisos, menus);
    return usuario;
  }

  // Único punto de entrada del shell admin: se llama UNA vez al montar el shell, nunca por vista/formulario.
  // `login()` ya deja `usuario` en memoria — este método cubre tanto el caso de un reload duro (el signal se
  // perdió pero el token sigue siendo válido) como el caso de un login recién hecho (login() no trae rol/permisos/
  // menús, solo `debe_cambiar_password`). Si `rol()` ya está en memoria, no pega red.
  async cargarSesion(): Promise<void> {
    if (!this.rol()) {
      await this.me();
    }
  }

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    const { data: keyData } = await firstValueFrom(
      this.http.get<{ data: { public_key: string } }>(`${this.apiUrl}${this.endpoints.publicKey}`)
    );

    await firstValueFrom(
      this.http.post(`${this.apiUrl}${this.endpoints.cambiarPassword}`, {
        password_actual: this.encryptWithPublicKey(passwordActual, keyData.public_key),
        password_nueva: this.encryptWithPublicKey(passwordNueva, keyData.public_key),
      })
    );

    this.debeCambiarPassword.set(false);
  }

  // ── Acciones de admin sobre otras cuentas (solo isSuperUser/isAdmin) ──────
  // El backend genera una contraseña temporal y la manda por correo — nunca
  // viaja en la respuesta. Ver AuthController::resetPassword / unblockUser.
  async resetPassword(usuarioId: string): Promise<{ message: string }> {
    const res = await firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.apiUrl}${this.endpoints.resetPassword}/${usuarioId}`,
        {},
      ),
    );
    return res;
  }

  async unblockUser(email: string): Promise<{ message: string }> {
    const res = await firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.apiUrl}${this.endpoints.unblock}/${encodeURIComponent(email)}`,
        {},
      ),
    );
    return res;
  }

  private encryptWithPublicKey(plainText: string, publicKeyPem: string): string {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKeyPem);
    // jsencrypt usa PKCS1 v1.5 por defecto — el backend descifra con openssl_private_decrypt() sin flags especiales.
    const encrypted = encrypt.encrypt(plainText);
    if (!encrypted) {
      throw new Error('No se pudo cifrar el valor — verifique el formato de la clave pública.');
    }
    return encrypted;
  }
}
