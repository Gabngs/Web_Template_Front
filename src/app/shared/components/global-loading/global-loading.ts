import { Component, inject } from '@angular/core';
import { LoadingOverlayService } from '@services/ui/loading-overlay.service';
import { AnillosLoader } from '../anillos-loader/anillos-loader';

// Overlay global de carga — una sola instancia montada en app.html. Lo
// activa loading.interceptor.ts automáticamente en cada request a la API,
// ninguna pantalla necesita cablear su propio spinner/loading.
@Component({
  selector: 'app-global-loading',
  imports: [AnillosLoader],
  templateUrl: './global-loading.html',
  styleUrl: './global-loading.scss',
})
export class GlobalLoading {
  private readonly overlay = inject(LoadingOverlayService);
  readonly visible = this.overlay.visible;
}
