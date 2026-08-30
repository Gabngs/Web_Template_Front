import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Textarea } from 'primeng/textarea';
import { Button, ButtonDirective } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { PermisoService } from '@services/api/permiso.service';
import { RolesService } from '@services/api/roles.service';
import { PermisoRolService } from '@services/api/permiso-rol.service';
import { ParametrosSistemaService } from '@services/api/parametros-sistema.service';
import { IRol, IRolStoreUpdate } from '@interfaces/models/rol.interface';
import { IContentPermiso, IContentPermisoTiny } from '@interfaces/models/content-permiso.interface';
import { HelperMessage } from '@shared/helpers/helper-message';
import { AsignacionPicklistDialog, IAsignacionItem } from '@shared/components/asignacion-picklist-dialog/asignacion-picklist-dialog';

@Component({
  selector: 'app-mantenimiento-roles',
  imports: [FormsModule, InputText, IconField, InputIcon, Textarea, Button, ButtonDirective, ToggleSwitch, FloatLabel, ConfirmDialog, Tag, Toolbar, TableModule, Dialog, AsignacionPicklistDialog],
  providers: [ConfirmationService],
  templateUrl: './mantenimiento-roles.html',
  styleUrl: './mantenimiento-roles.scss',
})
export class MantenimientoRoles implements OnInit {
  @ViewChild('dt') dt!: Table;

  private readonly svc          = inject(RolesService);
  private readonly permisoRolSvc = inject(PermisoRolService);
  private readonly parametrosSvc = inject(ParametrosSistemaService);
  private readonly helperMessage = inject(HelperMessage);
  private readonly confirm = inject(ConfirmationService);
  private readonly permiso = inject(PermisoService);

  // ─── Permisos (gating fino) ─────────────────
  readonly canView   = computed(() => this.permiso.hasPermission('view', 'roles'));
  readonly canCreate = computed(() => this.permiso.hasPermission('create', 'roles'));
  readonly canUpdate = computed(() => this.permiso.hasPermission('update', 'roles'));
  readonly canDelete = computed(() => this.permiso.hasPermission('delete', 'roles'));

  // ─── Datos ────────────────────────────────
  data     = signal<IRol[]>([]);
  editing: IRol | null = null;

  // ─── UI ───────────────────────────────────
  loading    = signal(false);
  showDialog = signal(false);
  editMode   = signal(false);

  rows = 20;
  rowsPerPageOptions = [10, 20, 50];
  tableMessage = 'Mostrando {first} a {last} de {totalRecords} registros';

  // ─── Formulario del diálogo ────────────────
  form: IRolStoreUpdate = { name: '', slug: '', descripcion: '', activo: true };

  ngOnInit(): void {
    this.getData();
    this.cargarCatalogoPermisos();
  }

  getData(): void {
    this.loading.set(true);
    this.svc.getIndex().subscribe({
      next: res => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los roles.');
        this.loading.set(false);
      },
    });
  }

  openNew(): void {
    this.editing = null;
    this.editMode.set(false);
    this.form = { name: '', slug: '', descripcion: '', activo: true };
    this.showDialog.set(true);
  }

  openEdit(item: IRol): void {
    this.editing = item;
    this.editMode.set(true);
    this.form = { name: item.name, slug: item.slug, descripcion: item.descripcion, activo: item.activo };
    this.showDialog.set(true);
  }

  save(): void {
    if (!this.form.name || !this.form.slug) {
      this.helperMessage.warn('Completa los campos obligatorios.');
      return;
    }
    this.loading.set(true);

    const obs = this.editMode() && this.editing
      ? this.svc.update(this.editing.id!, this.form)
      : this.svc.create(this.form);

    obs.subscribe({
      next: res => {
        this.helperMessage.success(res.message);
        this.showDialog.set(false);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al guardar el rol.');
        this.loading.set(false);
      },
    });
  }

  // Toggle de estado desde la tabla — protegido por canUpdate() en el template.
  cambiarEstado(item: IRol): void {
    if (!item.id) return;
    const activo = !item.activo;
    this.loading.set(true);

    this.svc.update(item.id, { activo }).subscribe({
      next: res => {
        this.helperMessage.success(res.message ?? `Rol ${activo ? 'activado' : 'inactivado'} correctamente.`);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al actualizar el estado del rol.');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(item: IRol): void {
    this.confirm.confirm({
      message: `¿Eliminar el rol "${item.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(item.id!),
    });
  }

  private delete(id: string): void {
    this.svc.delete(id).subscribe({
      next: res => {
        this.helperMessage.success(res.message);
        this.getData();
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al eliminar el rol.'),
    });
  }

  // ─── Permisos asignados al rol (picklist) ──
  loadingPermisos    = signal(false);
  showPermisosDialog = signal(false);
  rolPermisos: IRol | null = null;
  allPermisos    = signal<IContentPermisoTiny[]>([]);
  sourcePermisos = signal<IContentPermisoTiny[]>([]);
  targetPermisos = signal<IContentPermisoTiny[]>([]);

  private cargarCatalogoPermisos(): void {
    this.parametrosSvc.getIndexPermisos().subscribe({
      next: res => {
        const data = res.data as IContentPermiso[];
        this.allPermisos.set(data.map(p => ({ id: p.id, codename: p.codename, desc: p.desc })));
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al cargar el catálogo de permisos.'),
    });
  }

  openPermisos(item: IRol): void {
    if (!item.id) return;
    this.rolPermisos = item;
    this.loadingPermisos.set(true);

    this.permisoRolSvc.getPermisosDeRol(item.id).subscribe({
      next: asignados => {
        const asignadosIds = new Set(asignados.map(p => p.permiso!.id));
        const catalogo = this.allPermisos();
        this.targetPermisos.set(catalogo.filter(p => asignadosIds.has(p.id)));
        this.sourcePermisos.set(catalogo.filter(p => !asignadosIds.has(p.id)));
        this.loadingPermisos.set(false);
        this.showPermisosDialog.set(true);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los permisos del rol.');
        this.loadingPermisos.set(false);
      },
    });
  }

  savePermisos(asignados: IAsignacionItem[]): void {
    const rol = this.rolPermisos;
    if (!rol?.id) return;
    this.loadingPermisos.set(true);

    const permisoIds = asignados.map(p => p.id);
    this.permisoRolSvc.sync({ rol_id: rol.id, permiso_ids: permisoIds }).subscribe({
      next: () => {
        this.helperMessage.success('Permisos del rol actualizados correctamente.');
        this.showPermisosDialog.set(false);
        this.loadingPermisos.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al sincronizar los permisos.');
        this.loadingPermisos.set(false);
      },
    });
  }
}
