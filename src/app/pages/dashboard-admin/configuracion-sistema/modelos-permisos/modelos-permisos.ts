import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Textarea } from 'primeng/textarea';
import { Button, ButtonDirective } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Select, SelectChangeEvent } from 'primeng/select';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Toolbar } from 'primeng/toolbar';
import { FloatLabel } from 'primeng/floatlabel';
import { Table, TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { PermisoService } from '@services/api/permiso.service';
import { ParametrosSistemaService } from '@services/api/parametros-sistema.service';
import { IContentModel, IContentModelCreate } from '@interfaces/models/content-model.interface';
import { IContentPermiso, IContentPermisoCreate } from '@interfaces/models/content-permiso.interface';
import { IPermisoAgrupado, IPermisoTemplate } from '@interfaces/models/permiso-agrupado.interface';
import { HelperMessage } from '@shared/helpers/helper-message';

const ACCIONES: { accion: string; verbo: string }[] = [
  { accion: 'view', verbo: 'ver' },
  { accion: 'create', verbo: 'crear' },
  { accion: 'update', verbo: 'actualizar' },
  { accion: 'delete', verbo: 'eliminar' },
];

@Component({
  selector: 'app-modelos-permisos',
  imports: [
    FormsModule,
    InputText,
    IconField,
    InputIcon,
    Textarea,
    Button,
    ButtonDirective,
    Checkbox,
    Select,
    FloatLabel,
    Toolbar,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    Dialog,
  ],
  templateUrl: './modelos-permisos.html',
  styleUrl: './modelos-permisos.scss',
})
export class ModelosPermisos implements OnInit {
  @ViewChild('dtModelos') dtModelos!: Table;

  private readonly svc = inject(ParametrosSistemaService);
  private readonly helperMessage = inject(HelperMessage);
  readonly permiso = inject(PermisoService);

  // ─── Permisos de sección (gating fino) ─────
  readonly canCreateModelo = computed(() => this.permiso.hasPermission('create', 'content_model'));
  readonly canUpdateModelo = computed(() => this.permiso.hasPermission('update', 'content_model'));
  readonly canCreatePermiso = computed(() => this.permiso.hasPermission('create', 'content_permisos'));
  readonly canUpdatePermiso = computed(() => this.permiso.hasPermission('update', 'content_permisos'));


  // ══════════════════════════════════════════
  // Tab 1 — Registro de Modelos
  // ══════════════════════════════════════════
  loadingModelos = signal(false);
  models = signal<IContentModel[]>([]);
  newModeloDialog = signal(false);
  editModeloDialog = signal(false);
  editingModelo: IContentModel | null = null;
  modeloForm: IContentModelCreate = { app_label: '', app_model: '', nombre_display: '' };

  rows = 30;
  rowsPerPageOption = [10, 30, 50, 100];
  tableMessage = 'Mostrando {first} a {last} de {totalRecords} registros';

  ngOnInit(): void {
    this.loadModelos();
    this.loadPermisos();
  }

  loadModelos(): void {
    this.loadingModelos.set(true);
    this.svc.getIndexModelos().subscribe({
      next: res => {
        this.models.set(res.data as IContentModel[]);
        this.loadingModelos.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los modelos.');
        this.loadingModelos.set(false);
      },
    });
  }

  openNewModeloDialog(): void {
    this.modeloForm = { app_label: '', app_model: '', nombre_display: '' };
    this.newModeloDialog.set(true);
  }

  openEditModeloDialog(item: IContentModel): void {
    this.editingModelo = item;
    this.modeloForm = { app_label: item.app_label, app_model: item.app_model, nombre_display: item.nombre_display };
    this.editModeloDialog.set(true);
  }

  saveModelo(): void {
    if (!this.modeloForm.app_label || !this.modeloForm.app_model || !this.modeloForm.nombre_display) {
      this.helperMessage.warn('Completa todos los campos.');
      return;
    }
    this.loadingModelos.set(true);

    const request$ = this.editingModelo
      ? this.svc.updateModelo(this.editingModelo.id, this.modeloForm)
      : this.svc.createModelo(this.modeloForm);

    request$.subscribe({
      next: res => {
        this.helperMessage.success(res.message);
        this.newModeloDialog.set(false);
        this.editModeloDialog.set(false);
        this.editingModelo = null;
        this.loadingModelos.set(false);
        this.loadModelos();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al guardar el modelo.');
        this.loadingModelos.set(false);
      },
    });
  }

  // ══════════════════════════════════════════
  // Tab 2 — Registro de Permisos
  // ══════════════════════════════════════════
  loadingPermisos = signal(false);
  permisos = signal<IContentPermiso[]>([]);
  searchTerm = signal('');
  readonly grupos = computed<IPermisoAgrupado[]>(() => {
    const porModelo = new Map<string, IPermisoAgrupado>();
    for (const p of this.permisos()) {
      const modelo = p.content_model;
      if (!modelo) continue;
      let grupo = porModelo.get(modelo.id);
      if (!grupo) {
        grupo = { modeloId: modelo.id, label: `${modelo.app_label} - ${modelo.app_model}`, permisos: [] };
        porModelo.set(modelo.id, grupo);
      }
      grupo.permisos.push(p);
    }
    return Array.from(porModelo.values()).sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly gruposFiltrados = computed<IPermisoAgrupado[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.grupos();

    return this.grupos()
      .map(grupo => ({
        ...grupo,
        permisos: grupo.permisos.filter(
          p =>
            p.codename.toLowerCase().includes(term) ||
            p.desc.toLowerCase().includes(term) ||
            grupo.label.toLowerCase().includes(term),
        ),
      }))
      .filter(grupo => grupo.permisos.length > 0);
  });

  loadPermisos(): void {
    this.loadingPermisos.set(true);
    this.svc.getIndexPermisos({ with_model: true }).subscribe({
      next: res => {
        this.permisos.set(res.data as IContentPermiso[]);
        this.loadingPermisos.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los permisos.');
        this.loadingPermisos.set(false);
      },
    });
  }

  // ─── Dialog "Nuevo Permiso" ─────────────────
  newPermisoDialog = signal(false);
  manualMode = false;

  modelos = signal<IContentModel[]>([]);
  modeloBusqueda = '';
  selectedModelo: IContentModel | null = null;
  template = signal<IPermisoTemplate[]>([]);

  manualForm: IContentPermisoCreate = { content_model_id: '', codename: '', desc: '' };

  openNewPermisoDialog(): void {
    this.manualMode = false;
    this.selectedModelo = null;
    this.modeloBusqueda = '';
    this.template.set([]);
    this.manualForm = { content_model_id: '', codename: '', desc: '' };
    this.newPermisoDialog.set(true);
    this.cargarModelos();
  }

  cargarModelos(search?: string): void {
    this.svc.getIndexModelos({ paginate: false, search: search?.trim() || undefined }).subscribe({
      next: res => this.modelos.set(res.data as IContentModel[]),
      error: err => this.helperMessage.notifyHttpError(err, 'Error al cargar los modelos.'),
    });
  }

  onModeloSelect(event: SelectChangeEvent): void {
    const modelo = event.value as IContentModel;
    this.selectedModelo = modelo;
    this.manualForm.content_model_id = modelo.id;
    this.template.set(this.generarPermisosTemplate(modelo));
  }

  private generarPermisosTemplate(modelo: IContentModel): IPermisoTemplate[] {
    const existentes = new Set(
      this.permisos()
        .filter(p => p.content_model?.id === modelo.id)
        .map(p => p.codename),
    );

    return ACCIONES.map(({ accion, verbo }) => {
      const codename = `can_${accion}_${modelo.app_model}`;
      const disabled = existentes.has(codename);
      return {
        codename,
        name: `Puede ${verbo} ${modelo.nombre_display}`,
        checked: !disabled,
        disabled,
      };
    });
  }

  savePermisos(): void {
    if (this.manualMode) {
      this.saveManualPermiso();
      return;
    }

    if (!this.selectedModelo) {
      this.helperMessage.warn('Selecciona un modelo.');
      return;
    }

    const marcados = this.template().filter(t => t.checked && !t.disabled);
    if (marcados.length === 0) {
      this.helperMessage.warn('Marca al menos un permiso.');
      return;
    }

    this.loadingPermisos.set(true);

    const onSuccess = (message: string): void => {
      this.helperMessage.success(message);
      this.newPermisoDialog.set(false);
      this.loadingPermisos.set(false);
      this.loadPermisos();
    };
    const onError = (err: unknown): void => {
      this.helperMessage.notifyHttpError(err, 'Error al crear los permisos.');
      this.loadingPermisos.set(false);
    };

    if (marcados.length === 1) {
      this.svc
        .createPermiso({
          content_model_id: this.selectedModelo.id,
          codename: marcados[0].codename,
          desc: marcados[0].name,
        })
        .subscribe({ next: res => onSuccess(res.message), error: onError });
    } else {
      this.svc
        .createPermisosBulk({
          content_model_id: this.selectedModelo.id,
          permisos: marcados.map(t => ({ codename: t.codename, desc: t.name })),
        })
        .subscribe({ next: res => onSuccess(res.message), error: onError });
    }
  }

  private saveManualPermiso(): void {
    if (!this.manualForm.content_model_id || !this.manualForm.codename || !this.manualForm.desc) {
      this.helperMessage.warn('Completa todos los campos.');
      return;
    }
    this.loadingPermisos.set(true);
    this.svc.createPermiso(this.manualForm).subscribe({
      next: res => {
        this.helperMessage.success(res.message);
        this.newPermisoDialog.set(false);
        this.loadingPermisos.set(false);
        this.loadPermisos();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al crear el permiso.');
        this.loadingPermisos.set(false);
      },
    });
  }
}
