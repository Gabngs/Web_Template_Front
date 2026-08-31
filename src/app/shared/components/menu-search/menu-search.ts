import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { PermisoService } from '@services/api/permiso.service';
import { IMenuBusqueda } from '@shared/helpers/menu-tree.helper';

// Buscador global de menús (Ctrl+K). Fuente de datos: lista plana derivada de
// permiso.menusBusqueda() — mismo signal base que alimenta el sidebar, sin
// duplicar fetch. Markup propio (no p-listbox) para poder mostrar el ícono
// como badge de color, la descripción como subtítulo y el chip de sección,
// igual que el resto de pantallas de este estándar.
@Component({
  selector: 'app-menu-search',
  imports: [FormsModule, Dialog, InputText, Avatar, Tag],
  templateUrl: './menu-search.html',
  styleUrl: './menu-search.scss',
})
export class MenuSearch {
  private readonly router = inject(Router);
  private readonly permiso = inject(PermisoService);

  readonly abierto = signal(false);
  readonly termino = signal('');
  readonly indiceActivo = signal(0);

  readonly resultados = computed<IMenuBusqueda[]>(() => {
    const term = this.termino().trim().toLowerCase();
    const items = this.permiso.menusBusqueda();
    if (!term) return items;
    return items.filter(
      m =>
        m.titulo.toLowerCase().includes(term) ||
        (m.descripcion ?? '').toLowerCase().includes(term) ||
        (m.parentTitulo ?? '').toLowerCase().includes(term),
    );
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const esAtajo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (esAtajo) {
      event.preventDefault();
      this.alternar();
      return;
    }

    if (!this.abierto()) return;

    switch (event.key) {
      case 'Escape':
        this.cerrar();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.indiceActivo.update(i => Math.min(i + 1, this.resultados().length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.indiceActivo.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const item = this.resultados()[this.indiceActivo()];
        if (item) this.navegar(item);
        break;
      }
    }
  }

  alternar(): void {
    this.abierto.update(v => !v);
    if (this.abierto()) {
      this.termino.set('');
      this.indiceActivo.set(0);
    }
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  onTerminoChange(valor: string): void {
    this.termino.set(valor);
    this.indiceActivo.set(0);
  }

  navegar(item: IMenuBusqueda): void {
    this.cerrar();
    if (item.ruta) {
      this.router.navigateByUrl(item.ruta);
    }
  }
}
