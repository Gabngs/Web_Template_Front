import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, concat } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { Button, ButtonDirective } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { TreeTableModule, TreeTable } from 'primeng/treetable';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { TreeNode, ConfirmationService } from 'primeng/api';
import { PermisoService } from '@services/api/permiso.service';
import { MenusService } from '@services/api/menus.service';
import { SistemasService } from '@services/api/sistemas.service';
import { ParametrosSistemaService } from '@services/api/parametros-sistema.service';
import { IMenu, IMenuStoreUpdate } from '@interfaces/models/menu.interface';
import { IContentPermiso, IContentPermisoTiny } from '@interfaces/models/content-permiso.interface';
import { construirArbolMenusCrud, menusConSangria } from '@shared/helpers/menu-crud-tree.helper';
import { PRIME_ICON_OPTIONS } from '@shared/helpers/prime-icons.helper';
import { HelperMessage } from '@shared/helpers/helper-message';
import { AsignacionPicklistDialog, IAsignacionItem } from '@shared/components/asignacion-picklist-dialog/asignacion-picklist-dialog';
import { environment } from '../../../../../environments/environment';

interface IPadreOpcion { id: string; label: string }

// El template es mono-sistema — no hay selector de sistema en la UI como en
// gsp-front (que administra varios). El id se resuelve una vez al montar
// filtrando siaw_sistemas por este código (mismo de environment/PermisoService).
const CODIGO_SISTEMA_PROPIO = environment.sistemaCodigo;

@Component({
  selector: 'app-mantenimiento-menus',
  imports: [
    FormsModule, InputText, IconField, InputIcon, Select, Button, ButtonDirective, ToggleSwitch,
    FloatLabel, ConfirmDialog, Tag, Toolbar, TreeTableModule, Dialog, InputNumber, AsignacionPicklistDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './mantenimiento-menus.html',
  styleUrl: './mantenimiento-menus.scss',
})
export class MantenimientoMenus implements OnInit {
  private readonly menusSvc      = inject(MenusService);
  private readonly sistemasSvc   = inject(SistemasService);
  private readonly parametrosSvc = inject(ParametrosSistemaService);
  private readonly helperMessage = inject(HelperMessage);
  private readonly confirm       = inject(ConfirmationService);
  private readonly permiso       = inject(PermisoService);

  // ─── Permisos (gating fino) ─────────────────
  readonly canView   = computed(() => this.permiso.hasPermission('view', 'menus'));
  readonly canCreate = computed(() => this.permiso.hasPermission('create', 'menus'));
  readonly canUpdate = computed(() => this.permiso.hasPermission('update', 'menus'));
  readonly canDelete = computed(() => this.permiso.hasPermission('delete', 'menus'));

  // ─── Datos ────────────────────────────────
  menusFlat  = signal<IMenu[]>([]);
  allPermisos = signal<IContentPermisoTiny[]>([]);

  // Id del sistema propio, resuelto una sola vez — ver resolverSistemaPropio().
  private readonly sistemaId = signal<string | null>(null);
  searchTerm = signal('');
  rows = 20;
  rowsPerPageOptions = [10, 20, 50];
  tableMessage = 'Mostrando {first} a {last} de {totalRecords} registros';

  readonly menusDelSistema = computed<IMenu[]>(() => {
    const sistemaId = this.sistemaId();
    const menus = this.menusFlat();
    return sistemaId ? menus.filter(m => m.sistema?.id === sistemaId) : menus;
  });

  readonly treeNodos = computed<TreeNode<IMenu>[]>(() => construirArbolMenusCrud(this.menusDelSistema()));

  readonly parentOptions = computed<IPadreOpcion[]>(() => {
    const excludeId = this.editing()?.id;
    const opciones = menusConSangria(this.menusDelSistema()).filter(o => o.id !== excludeId);
    return [{ id: '', label: 'Ninguno (raíz)' }, ...opciones];
  });

  readonly iconOptions = PRIME_ICON_OPTIONS;

  // ─── UI ───────────────────────────────────
  loading    = signal(false);
  showDialog = signal(false);
  editMode   = signal(false);
  editing    = signal<IMenu | null>(null);

  // ─── Formulario del diálogo crear/editar ───
  form: IMenuStoreUpdate = { titulo: '', parent_id: null, activo: true, dashboard: false, orden: 0 };

  ngOnInit(): void {
    this.resolverSistemaPropio();
    this.getData();
    this.getCatalogoPermisos();
  }


  resolverSistemaPropio(): void {
    this.sistemasSvc.getIndex({ codigo: CODIGO_SISTEMA_PROPIO }).subscribe({
      next: res => {
        const sistema = res.data.find(s => s.codigo === CODIGO_SISTEMA_PROPIO) ?? res.data[0];
        if (!sistema?.id) {
          this.helperMessage.warn(`No se encontró el sistema propio (${CODIGO_SISTEMA_PROPIO}) — verificá que exista en siaw_sistemas.`);
          return;
        }
        this.sistemaId.set(sistema.id);
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al resolver el sistema propio.'),
    });
  }

  getData(): void {
    this.loading.set(true);
    this.menusSvc.getIndex().subscribe({
      next: res => {
        this.menusFlat.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los menús.');
        this.loading.set(false);
      },
    });
  }

  getCatalogoPermisos(): void {
    this.parametrosSvc.getIndexPermisos({ with_model: true }).subscribe({
      next: res => {
        const data = res.data as IContentPermiso[];
        this.allPermisos.set(data.map(p => ({ id: p.id, codename: p.codename, desc: p.desc })));
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al cargar el catálogo de permisos.'),
    });
  }

  filtrarArbol(dt: TreeTable, value: string): void {
    dt.filterGlobal(value, 'contains');
  }

  // ─── Crear / Editar menú ───────────────────
  openNew(): void {
    this.editing.set(null);
    this.editMode.set(false);
    this.form = { titulo: '', parent_id: null, activo: true, dashboard: false, orden: this.nextOrden(null) };
    this.showDialog.set(true);
  }


  openNewSubmenu(item: IMenu): void {
    if (!item.id) return;
    this.editing.set(null);
    this.editMode.set(false);
    this.form = { titulo: '', parent_id: item.id, activo: true, dashboard: false, orden: this.nextOrden(item.id) };
    this.showDialog.set(true);
  }


  private nextOrden(parentId: string | null): number {
    const hermanos = this.menusDelSistema().filter(m => (m.parent?.id ?? null) === parentId);
    const maxOrden = hermanos.reduce((max, m) => Math.max(max, m.orden ?? 0), -1);
    return maxOrden + 1;
  }

  openEdit(item: IMenu): void {
    this.editing.set(item);
    this.editMode.set(true);
    this.form = {
      titulo: item.titulo,
      descripcion: item.descripcion,
      ruta: item.ruta,
      nombre_icon: item.nombre_icon,
      orden: item.orden,
      activo: item.activo,
      dashboard: item.dashboard,
      parent_id: item.parent?.id ?? null,
    };
    this.showDialog.set(true);
  }

  save(): void {
    if (!this.form.titulo) {
      this.helperMessage.warn('El título es obligatorio.');
      return;
    }
    const sistemaId = this.sistemaId();
    if (!this.editMode() && !sistemaId) {
      this.helperMessage.warn('No se pudo resolver el sistema propio todavía — reintentá en un momento.');
      return;
    }
    this.loading.set(true);

    const ruta = this.form.ruta?.trim() || null;
    const rutaNormalizada = ruta && !ruta.startsWith('/') ? `/${ruta}` : ruta;

    const payload: IMenuStoreUpdate = { ...this.form, ruta: rutaNormalizada, parent_id: this.form.parent_id || null };
    const editingItem = this.editing();

    const obs = this.editMode() && editingItem
      ? this.menusSvc.update(editingItem.id!, payload)
      : this.menusSvc.create({ ...payload, sistema_id: sistemaId! });

    obs.subscribe({
      next: res => {
        this.helperMessage.success(res.message);
        this.showDialog.set(false);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al guardar el menú.');
        this.loading.set(false);
      },
    });
  }

  // Toggle de estado desde la tabla — protegido por canUpdate() en el template.
  cambiarEstado(item: IMenu): void {
    if (!item.id) return;
    const activo = !item.activo;
    this.loading.set(true);

    this.menusSvc.update(item.id, { activo }).subscribe({
      next: res => {
        this.helperMessage.success(res.message ?? `Menú ${activo ? 'activado' : 'inactivado'} correctamente.`);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al actualizar el estado del menú.');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(item: IMenu): void {
    this.confirm.confirm({
      message: `¿Eliminar el menú "${item.titulo}"? Esto también afecta a sus hijos.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(item.id!),
    });
  }

  private delete(id: string): void {
    this.menusSvc.delete(id).subscribe({
      next: res => {
        this.helperMessage.success(res.message ?? 'Menú eliminado correctamente.');
        this.getData();
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al eliminar el menú.'),
    });
  }

  // ─── Permiso requerido (picklist, único) ────
  loadingPermisos   = signal(false);
  showPermisosDialog = signal(false);
  menuPermisos: IMenu | null = null;
  sourcePermisos = signal<IContentPermisoTiny[]>([]);
  targetPermisos = signal<IContentPermisoTiny[]>([]);

  private pivotIdPorPermisoId = new Map<string, string>();
  private asignadosOriginalIds = new Set<string>();

  openPermisos(item: IMenu): void {
    if (!item.id) return;
    this.menuPermisos = item;
    this.loadingPermisos.set(true);

    this.menusSvc.getPermisosDeMenu(item.id).subscribe({
      next: filas => {
        this.pivotIdPorPermisoId.clear();
        const asignadosIds = new Set<string>();
        for (const fila of filas) {
          if (fila.permiso?.id && fila.id) {
            this.pivotIdPorPermisoId.set(fila.permiso.id, fila.id);
            asignadosIds.add(fila.permiso.id);
          }
        }
        this.asignadosOriginalIds = asignadosIds;

        const catalogo = this.allPermisos();
        this.targetPermisos.set(catalogo.filter(p => asignadosIds.has(p.id)));
        this.sourcePermisos.set(catalogo.filter(p => !asignadosIds.has(p.id)));

        this.loadingPermisos.set(false);
        this.showPermisosDialog.set(true);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los permisos del menú.');
        this.loadingPermisos.set(false);
      },
    });
  }

  savePermisos(asignados: IAsignacionItem[]): void {
    const menu = this.menuPermisos;
    if (!menu?.id) return;

    // Un menú admite un único permiso requerido. Aun así el cálculo se hace
    // por diferencia de conjuntos para tolerar datos viejos con más de uno.
    const nuevosIds = asignados.map(p => p.id);
    const nuevosSet = new Set(nuevosIds);
    const quitados  = [...this.asignadosOriginalIds].filter(id => !nuevosSet.has(id));
    const agregados = nuevosIds.filter(id => !this.asignadosOriginalIds.has(id));

    if (quitados.length === 0 && agregados.length === 0) {
      this.showPermisosDialog.set(false);
      return;
    }

    this.loadingPermisos.set(true);

    // Secuencial (concat, no forkJoin): el desvincular tiene que completar
    // antes del vincular — el backend rechaza un 2º permiso sobre el mismo menú.
    const ops: Observable<unknown>[] = [
      ...quitados.map(id => this.menusSvc.desvincularPermiso(this.pivotIdPorPermisoId.get(id)!)),
      ...agregados.map(id => this.menusSvc.vincularPermiso({ menu_id: menu.id!, permiso_id: id })),
    ];

    concat(...ops).subscribe({
      complete: () => {
        this.helperMessage.success('Permiso del menú actualizado.');
        this.showPermisosDialog.set(false);
        this.loadingPermisos.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al actualizar el permiso.');
        this.loadingPermisos.set(false);
      },
    });
  }
}
