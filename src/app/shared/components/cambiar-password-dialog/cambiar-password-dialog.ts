import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from 'primeng/dialog';
import { Password } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { AuthService } from '@services/api/auth.service';

const PASSWORD_MIN_LEN = 8;

@Component({
  selector: 'app-cambiar-password-dialog',
  imports: [FormsModule, Dialog, Password, FloatLabel, Button],
  templateUrl: './cambiar-password-dialog.html',
  styleUrl: './cambiar-password-dialog.scss',
})
export class CambiarPasswordDialog {
  private readonly auth = inject(AuthService);

  // El backend (ForzarCambioPassword) bloquea toda ruta salvo /auth/me,
  // /auth/logout y /auth/cambiar-password mientras esto sea true — el dialog
  // no es cerrable, es la única salida del estado bloqueado.
  readonly visible = computed(() => this.auth.debeCambiarPassword());

  passwordActual = '';
  passwordNueva = '';
  passwordConfirmar = '';

  loading = signal(false);
  error = signal('');

  get erroresValidacion(): string | null {
    if (this.passwordNueva && this.passwordNueva.length < PASSWORD_MIN_LEN) {
      return `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LEN} caracteres.`;
    }
    if (this.passwordNueva && this.passwordActual && this.passwordNueva === this.passwordActual) {
      return 'La nueva contraseña debe ser diferente a la actual.';
    }
    if (this.passwordConfirmar && this.passwordNueva !== this.passwordConfirmar) {
      return 'Las contraseñas no coinciden.';
    }
    return null;
  }

  async submit(): Promise<void> {
    this.error.set('');

    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirmar) {
      this.error.set('Completa todos los campos.');
      return;
    }
    if (this.erroresValidacion) {
      this.error.set(this.erroresValidacion);
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.cambiarPassword(this.passwordActual, this.passwordNueva);
      this.passwordActual = '';
      this.passwordNueva = '';
      this.passwordConfirmar = '';
      // El shell (AdminShell) puede haber abortado su carga de sesión/permisos
      // por el 403 previo — recargar es la forma simple de rearrancar ese
      // bootstrap ahora que debe_cambiar_password quedó en false server-side.
      window.location.reload();
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.error.set('La contraseña actual es incorrecta.');
      } else if (err instanceof HttpErrorResponse && err.status === 422) {
        const detalle = err.error?.errors?.password_nueva?.[0] ?? err.error?.message;
        this.error.set(detalle ?? 'La nueva contraseña no es válida.');
      } else {
        this.error.set('No se pudo cambiar la contraseña. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
