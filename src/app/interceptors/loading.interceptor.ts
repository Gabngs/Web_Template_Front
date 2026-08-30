import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadingOverlayService } from '@services/ui/loading-overlay.service';

// Muestra el overlay global mientras haya al menos un request de la API
// pendiente — automático para cualquier pantalla nueva, no hace falta
// cablear un signal `loading` propio por componente.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const overlay = inject(LoadingOverlayService);
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  overlay.show();
  return next(req).pipe(finalize(() => overlay.hide()));
};
