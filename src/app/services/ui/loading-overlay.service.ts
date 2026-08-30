import { Injectable, signal } from '@angular/core';

// Contador de requests en vuelo, no un booleano — si dos llamadas están
// activas y la primera en resolver hiciera hide(), el overlay desaparecería
// mientras la segunda todavía está cargando. Ver loading.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class LoadingOverlayService {
  private readonly pendientes = signal(0);
  readonly visible = signal(false);

  show(): void {
    this.pendientes.update(v => v + 1);
    this.visible.set(true);
  }

  hide(): void {
    const restante = Math.max(0, this.pendientes() - 1);
    this.pendientes.set(restante);
    if (restante === 0) this.visible.set(false);
  }
}
