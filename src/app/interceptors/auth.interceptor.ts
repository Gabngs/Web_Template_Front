import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '@services/storage/token-storage.service';
import { AuthService } from '@services/api/auth.service';

const PUBLIC_PATHS = [
  environment.endpoints.auth.publicKey,
  environment.endpoints.auth.challenge,
  environment.endpoints.auth.login,
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isPublicPath = PUBLIC_PATHS.some(path => req.url.includes(path));
  const token = tokenStorage.get();

  const request = !isApiRequest || isPublicPath || !token
    ? req
    // El token ya incluye el prefijo "session_key@" — se envía completo tal cual.
    : req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(request).pipe(
    catchError((err: unknown) => {
      // ForzarCambioPassword (gsp-back) bloquea toda ruta salvo /auth/me,
      // /auth/logout y /auth/cambiar-password con este 403 — abre el dialog global.
      if (err instanceof HttpErrorResponse && err.status === 403 && err.error?.accion === 'cambiar_password') {
        auth.forzarCambioPassword();
      }

      if (err instanceof HttpErrorResponse && err.status === 401 && isApiRequest && !isPublicPath && token) {
        auth.limpiarSesionLocal();
        setTimeout(() => router.navigate(['/login']), 1500);
      }

      return throwError(() => err);
    }),
  );
};
