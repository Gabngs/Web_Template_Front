import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { Button, ButtonDirective } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { Table, TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '@services/api/auth.service';
import { PermisoService } from '@services/api/permiso.service';
import { UsuariosService } from '@services/api/usuarios.service';
import { PermisoUsuarioService } from '@services/api/permiso-usuario.service';
import { RolUsuarioService } from '@services/api/rol-usuario.service';
import { ParametrosSistemaService } from '@services/api/parametros-sistema.service';
import { IUsuario, IUsuarioCreate, IUsuarioFiltros } from '@interfaces/models/usuario.interface';
import { IRol, IRolTiny } from '@interfaces/models/rol.interface';
import { IContentPermiso, IContentPermisoTiny } from '@interfaces/models/content-permiso.interface';
import { HelperMessage } from '@shared/helpers/helper-message';
import { esCorreoValido, soloLetras, camposRequeridos } from '@shared/helpers/helper-validaciones';
import { AsignacionPicklistDialog, IAsignacionItem } from '@shared/components/asignacion-picklist-dialog/asignacion-picklist-dialog';

const ESTADOS = [
  { label: 'Activos', value: 1 },
  { label: 'Inactivos', value: 0 },
];

@Component({
  selector: 'app-control-usuarios',
  imports: [
    FormsModule,
    InputText,
    IconField,
    InputIcon,
    Select,
    Button,
    ButtonDirective,
    FloatLabel,
    ConfirmDialog,
    Tag,
    Toolbar,
    TableModule,
    Dialog,
    AsignacionPicklistDialog,
  ],

  providers: [ConfirmationService],
  templateUrl: './control-usuarios.html',
  styleUrl: './control-usuarios.scss',
})
export class ControlUsuarios implements OnInit {
  @ViewChild('dt') dt!: Table;

  private readonly svc = inject(UsuariosService);
  private readonly permisoUsuarioSvc = inject(PermisoUsuarioService);
  private readonly rolUsuarioSvc = inject(RolUsuarioService);
  private readonly parametrosSvc = inject(ParametrosSistemaService);
  private readonly helperMessage = inject(HelperMessage);
  private readonly confirm = inject(ConfirmationService);
  readonly auth = inject(AuthService);
  private readonly permiso = inject(PermisoService);

  // ─── Permisos (gating fino) ─────────────────
  readonly canView = computed(() => this.permiso.hasPermission('view', 'usuarios'));
  readonly canCreate = computed(() => this.permiso.hasPermission('create', 'usuarios'));
  readonly canUpdate = computed(() => this.permiso.hasPermission('update', 'usuarios'));
  readonly canDelete = computed(() => this.permiso.hasPermission('delete', 'usuarios'));

  // ─── Datos ────────────────────────────────
  data = signal<IUsuario[]>([]);
  dataItem = signal<IUsuario | null>(null);
  roles: IRol[] = [];
  estados = ESTADOS;

  // ─── UI ───────────────────────────────────
  loading = signal(false);
  showDialog = signal(false);
  editMode = signal(false);

  // ─── Tabla ────────────────────────────────
  totalRecords = signal(0);
  rows = 20;
  first = 0;
  rowsPerPageOptions = [10, 20, 50, 100];

  // ─── Filtros ──────────────────────────────
  searchTerm = signal('');
  rolFiltro = signal<string | null>(null);
  activoFiltro = signal<boolean | null>(null);

  // ─── Formulario del diálogo ────────────────
  form: IUsuarioCreate = { nombre: '', apellidos: '', email: '', rol_id: undefined };

  ngOnInit(): void {
    this.svc.getRoles().subscribe({
      next: (res) => (this.roles = res.data),
      error: err =>
        this.helperMessage.notifyHttpError(err, 'Error al cargar los roles.'),
    });
    this.getData();
    this.cargarCatalogoPermisos();
  }

  // paginate/page/per_page no son filtros de negocio (ver Filtros de Consulta) pero viajan
  // en el mismo objeto que consume getIndex — se calculan acá a partir de first/rows.
  private buildFiltros(): IUsuarioFiltros {
    const filtros: IUsuarioFiltros = {
      // paginate: true,
      // page: Math.floor(this.first / this.rows) + 1,
      // per_page: this.rows,
    };
    if (this.activoFiltro() !== null) filtros.activo = this.activoFiltro()!;
    if (this.rolFiltro()) filtros.rol_id = this.rolFiltro()!;
    if (this.searchTerm()) filtros.search = this.searchTerm();
    return filtros;
  }

  getData(): void {
    this.loading.set(true);
    this.svc.getIndex(this.buildFiltros()).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.totalRecords.set(res.meta?.total ?? res.data.length);
        this.loading.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.getData();
  }

  aplicarFiltros(): void {
    this.first = 0;
    this.getData();
  }

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.rolFiltro.set(null);
    this.activoFiltro.set(null);
    this.aplicarFiltros();
  }

  openNew(): void {
    this.dataItem.set(null);
    this.editMode.set(false);
    this.form = { nombre: '', apellidos: '', email: '', rol_id: undefined };
    this.showDialog.set(true);
  }

  openEdit(item: IUsuario): void {
    this.dataItem.set(item);
    this.editMode.set(true);
    this.form = {
      nombre: item.nombre,
      apellidos: item.apellidos ?? '',
      email: item.email,
      rol_id: item.rol?.id,
    };
    this.showDialog.set(true);
  }

  save(): void {
    if (!camposRequeridos({ nombre: this.form.nombre, email: this.form.email })) {
      this.helperMessage.warn('Completa los campos obligatorios.');
      return;
    }
    if (
      !soloLetras(this.form.nombre) ||
      (this.form.apellidos && !soloLetras(this.form.apellidos))
    ) {
      this.helperMessage.warn('El nombre y los apellidos solo pueden contener letras.');
      return;
    }
    if (!esCorreoValido(this.form.email ?? '')) {
      this.helperMessage.warn('Ingresa un correo electrónico válido.');
      return;
    }
    this.loading.set(true);
    const item = this.dataItem();

    const obs =
      this.editMode() && item ? this.svc.update(item.id, this.form) : this.svc.create(this.form);

    obs.subscribe({
      next: (res) => {
        this.helperMessage.success(res.message);
        this.showDialog.set(false);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al guardar el usuario.');
        this.loading.set(false);
      },
    });
  }

  cambiarEstado(item: IUsuario): void {
    const activo = !item.activo;
    this.loading.set(true);

    this.svc.update(item.id, { activo }).subscribe({
      next: (res) => {
        this.helperMessage.success(
          res.message ?? `Usuario ${activo ? 'activado' : 'inactivado'} correctamente.`,
        );
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al actualizar el estado del usuario.');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(item: IUsuario): void {
    this.confirm.confirm({
      message: `¿Eliminar al usuario "${item.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(item.id),
    });
  }

  private delete(id: string): void {
    this.svc.delete(id).subscribe({
      next: (res) => {
        this.helperMessage.success(res.message ?? 'Usuario eliminado correctamente.');
        this.getData();
      },
      error: err =>
        this.helperMessage.notifyHttpError(err, 'Error al eliminar el usuario.'),
    });
  }

  // ─── Reset de contraseña / desbloqueo (endpoints en AuthService) ────────
  confirmResetPassword(item: IUsuario): void {
    this.confirm.confirm({
      message: `¿Restablecer la contraseña de "${item.nombre}"? Se le enviará una nueva contraseña temporal al correo ${item.email}.`,
      header: 'Restablecer contraseña',
      icon: 'pi pi-key',
      accept: () => {
        this.loading.set(true);
        this.auth
          .resetPassword(item.id)
          .then((res) => this.helperMessage.success(res.message))
          .catch((err) => this.helperMessage.notifyHttpError(err, 'Error al restablecer la contraseña.'))
          .finally(() => this.loading.set(false));
      },
    });
  }

  confirmDesbloquear(item: IUsuario): void {
    this.confirm.confirm({
      message: `¿Desbloquear el acceso de "${item.nombre}"? Se limpian los intentos fallidos de inicio de sesión.`,
      header: 'Desbloquear acceso',
      icon: 'pi pi-lock-open',
      accept: () => {
        this.loading.set(true);
        this.auth
          .unblockUser(item.email)
          .then((res) => this.helperMessage.success(res.message))
          .catch((err) => this.helperMessage.notifyHttpError(err, 'Error al desbloquear el usuario.'))
          .finally(() => this.loading.set(false));
      },
    });
  }

  // Pivote siaw_rol_usuario — un usuario puede tener varios roles asignados.
  // Nota: esto NO cambia cómo se resuelven los permisos hoy (AuthService
  // sigue leyendo el rol_id único de siaw_usuarios) — es solo la asignación.
  showRolDialog = signal(false);
  loadingRol = signal(false);
  usuarioRol: IUsuario | null = null;
  allRoles = signal<IRolTiny[]>([]);
  sourceRoles = signal<IRolTiny[]>([]);
  targetRoles = signal<IRolTiny[]>([]);

  openAsignarRol(item: IUsuario): void {
    if (!item.id) return;
    this.usuarioRol = item;
    this.loadingRol.set(true);

    const catalogo: IRolTiny[] = this.roles.map((r) => ({ id: r.id!, name: r.name! }));
    this.allRoles.set(catalogo);

    this.rolUsuarioSvc.getRolesDeUsuario(item.id).subscribe({
      next: (asignados) => {
        const asignadosIds = new Set(asignados.map((ru) => ru.rol!.id));
        this.targetRoles.set(catalogo.filter((r) => asignadosIds.has(r.id)));
        this.sourceRoles.set(catalogo.filter((r) => !asignadosIds.has(r.id)));
        this.loadingRol.set(false);
        this.showRolDialog.set(true);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los roles del usuario.');
        this.loadingRol.set(false);
      },
    });
  }

  guardarRol(asignados: IAsignacionItem[]): void {
    const item = this.usuarioRol;
    if (!item?.id) return;
    this.loadingRol.set(true);

    const rolIds = asignados.map((r) => r.id);
    this.rolUsuarioSvc.sync({ usuario_id: item.id, rol_ids: rolIds }).subscribe({
      next: () => {
        this.helperMessage.success('Roles del usuario actualizados correctamente.');
        this.showRolDialog.set(false);
        this.loadingRol.set(false);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al sincronizar los roles.');
        this.loadingRol.set(false);
      },
    });
  }

  // ─── Asignar permiso directo (picklist) ────
  loadingPermisos = signal(false);
  showPermisosDialog = signal(false);
  usuarioPermisos: IUsuario | null = null;
  allPermisos = signal<IContentPermisoTiny[]>([]);
  sourcePermisos = signal<IContentPermisoTiny[]>([]);
  targetPermisos = signal<IContentPermisoTiny[]>([]);

  private cargarCatalogoPermisos(): void {
    this.parametrosSvc.getIndexPermisos().subscribe({
      next: (res) => {
        const data = res.data as IContentPermiso[];
        this.allPermisos.set(data.map((p) => ({ id: p.id, codename: p.codename, desc: p.desc })));
      },
      error: err =>
        this.helperMessage.notifyHttpError(err, 'Error al cargar el catálogo de permisos.'),
    });
  }

  openPermisos(item: IUsuario): void {
    if (!item.id) return;
    this.usuarioPermisos = item;
    this.loadingPermisos.set(true);

    this.permisoUsuarioSvc.getPermisosDeUsuario(item.id).subscribe({
      next: (asignados) => {
        const asignadosIds = new Set(asignados.map((p) => p.permiso!.id));
        const catalogo = this.allPermisos();
        this.targetPermisos.set(catalogo.filter((p) => asignadosIds.has(p.id)));
        this.sourcePermisos.set(catalogo.filter((p) => !asignadosIds.has(p.id)));
        this.loadingPermisos.set(false);
        this.showPermisosDialog.set(true);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los permisos del usuario.');
        this.loadingPermisos.set(false);
      },
    });
  }
  hasActiveFilters(): boolean {
    return !!this.searchTerm() || !!this.rolFiltro() || this.activoFiltro() !== null;
  }

  savePermisos(asignados: IAsignacionItem[]): void {
    const item = this.usuarioPermisos;
    if (!item?.id) return;
    this.loadingPermisos.set(true);

    const permisoIds = asignados.map((p) => p.id);
    this.permisoUsuarioSvc.sync({ usuario_id: item.id, permiso_ids: permisoIds }).subscribe({
      next: () => {
        this.helperMessage.success('Permisos del usuario actualizados correctamente.');
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
