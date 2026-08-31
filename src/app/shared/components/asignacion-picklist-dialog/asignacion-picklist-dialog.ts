import { Component, effect, input, model, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { PickList } from 'primeng/picklist';
import { Button, ButtonDirective } from 'primeng/button';

// Forma mínima que necesita el picklist: un id estable + los campos que se
// muestran/filtran según `tipo`. Cubre IContentPermisoTiny (permiso) e
// IRolTiny (rol) sin acoplar el componente a esas interfaces.
export interface IAsignacionItem {
  id: string;
  name?: string;
  codename?: string;
  desc?: string;
}

// Diálogo genérico de asignación con doble lista (p-pickList). Presentacional
// puro: NO hace HTTP. El padre le pasa el universo dividido en `disponibles` /
// `asignados` y recibe en `(guardar)` la lista final de asignados para
// persistir con su propio servicio (sync, vincular/desvincular, etc.).
//
// Reemplaza los 4 diálogos casi idénticos que vivían duplicados en
// mantenimiento-roles, control-usuarios (x2) y mantenimiento-menus.
@Component({
  selector: 'app-asignacion-picklist-dialog',
  imports: [Dialog, PickList, Button, ButtonDirective],
  templateUrl: './asignacion-picklist-dialog.html',
  styleUrl: './asignacion-picklist-dialog.scss',
})
export class AsignacionPicklistDialog {
  readonly visible = model(false);
  readonly header = input('');
  readonly subtitulo = input('');
  readonly disponibles = input<IAsignacionItem[]>([]);
  readonly asignados = input<IAsignacionItem[]>([]);
  readonly tipo = input<'rol' | 'permiso'>('permiso');
  /** Cuando es true el destino admite como máximo 1 item — al mover otro, reemplaza. */
  readonly unico = input(false);
  readonly loading = input(false);

  readonly guardar = output<IAsignacionItem[]>();

  // Estado de trabajo interno (se sincroniza con p-pickList vía two-way).
  readonly source = signal<IAsignacionItem[]>([]);
  readonly target = signal<IAsignacionItem[]>([]);

  private abiertoPrevio = false;

  constructor() {
    // Al pasar de cerrado -> abierto, sembrar el estado de trabajo desde los
    // inputs actuales del padre.
    effect(() => {
      const abierto = this.visible();
      if (abierto && !this.abiertoPrevio) {
        this.source.set([...this.disponibles()]);
        this.target.set([...this.asignados()]);
      }
      this.abiertoPrevio = abierto;
    });
  }

  filterByAttr(): string {
    return this.tipo() === 'rol' ? 'name' : 'codename,desc';
  }

  onTargetChange(arr: IAsignacionItem[]): void {
    if (this.unico() && arr.length > 1) {
      const conservado = arr[arr.length - 1];
      const sobrantes = arr.slice(0, -1);
      this.target.set([conservado]);
      // p-pickList ya sacó `conservado` del origen; devolvemos el resto.
      this.source.set([...this.source(), ...sobrantes]);
      return;
    }
    this.target.set(arr);
  }

  onGuardar(): void {
    this.guardar.emit(this.target());
  }

  cerrar(): void {
    this.visible.set(false);
  }
}
