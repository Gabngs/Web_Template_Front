import { Injectable, inject, signal, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { IRolRelation } from '@interfaces/models/rol.interface';
import { ISesionMenu } from '@interfaces/models/sesion-menu.interface';
import { construirArbolMenus, menusAPrimeNgItems, menusPlanosNavegables, IMenuBusqueda } from '@shared/helpers/menu-tree.helper';
import { SistemasService } from './sistemas.service';


const CODIGO_SISTEMA_PROPIO = 'GSP';

@Injectable({ providedIn: 'root' })
export class PermisoService {
  private readonly sistemasSvc = inject(SistemasService);

  readonly rol      = signal<IRolRelation | null>(null);
  readonly permisos = signal<string[]>([]);
  readonly menus    = signal<ISesionMenu[]>([]);

  // Id (UUID) del sistema propio, resuelto una sola vez por sesión contra
  // siaw_sistemas. Mientras no se resuelve, `menusPropios` queda vacío a
  // propósito — mejor no mostrar nada un instante que mostrar el sidebar
  // mezclado con menús de otro sistema.
  private readonly sistemaIdPropio = signal<string | null>(null);

  // Único punto de verdad: todo lo que renderiza sidebar/búsqueda/accesos
  // directos debe leer de acá, nunca de `menus()` crudo.
  readonly menusPropios = computed<ISesionMenu[]>(() => {
    const sistemaId = this.sistemaIdPropio();
    return sistemaId ? this.menus().filter(m => m.sistema_id === sistemaId) : [];
  });

  readonly menusArbol = computed<MenuItem[]>(() =>
    menusAPrimeNgItems(construirArbolMenus(this.menusPropios()))
  );

  readonly menusBusqueda = computed<IMenuBusqueda[]>(() =>
    menusPlanosNavegables(this.menusPropios())
  );

  establecerDesdeSesion(rol: IRolRelation | null, permisos: string[], menus: ISesionMenu[]): void {
    this.rol.set(rol);
    this.permisos.set(permisos ?? []);
    this.menus.set(menus ?? []);
    this.resolverSistemaPropio();
  }

  hasPermission(accion: string, modulo: string): boolean {
    return this.permisos().includes(`can_${accion}_${modulo}`);
  }

  private resolverSistemaPropio(): void {
    if (this.sistemaIdPropio()) return; // ya resuelto — no repetir la consulta en cada refresh de sesión
    this.sistemasSvc.getIndex({ codigo: CODIGO_SISTEMA_PROPIO }).subscribe({
      next: res => {
        const sistema = res.data.find(s => s.codigo === CODIGO_SISTEMA_PROPIO) ?? res.data[0];
        if (sistema?.id) this.sistemaIdPropio.set(sistema.id);
      },
    });
  }
}
