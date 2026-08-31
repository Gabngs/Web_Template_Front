import { Injectable, inject, signal } from '@angular/core';
import { ThemeStorageService } from '../storage/theme-storage.service';

// Único punto de verdad del tema claro/oscuro — consumido tanto por el sitio
// público (App) como por el shell admin. El preset PrimeNG (Aura, ver
// app.config.ts) ya reacciona a la clase `.app-dark` en <html> vía
// `darkModeSelector` (misma clase que usa el layout de Sakai), así que este
// servicio solo gestiona esa clase + persiste la preferencia (nunca
// localStorage directo, ver ThemeStorageService).
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(ThemeStorageService);

  readonly isDark = signal(this.leerPreferenciaInicial());

  constructor() {
    document.documentElement.classList.toggle('app-dark', this.isDark());
  }

  toggle(): void {
    this.isDark.update(v => !v);
    this.storage.set(this.isDark());
    this.aplicarClase();
  }

  // Envuelve el cambio de clase en startViewTransition cuando está disponible:
  // el swap claro/oscuro se ve con un crossfade suave en vez de un salto seco.
  private aplicarClase(): void {
    const set = () => document.documentElement.classList.toggle('app-dark', this.isDark());
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(set);
    } else {
      set();
    }
  }

  private leerPreferenciaInicial(): boolean {
    const guardada = this.storage.get();
    if (guardada !== null) return guardada;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
