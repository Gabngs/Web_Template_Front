import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
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
import { SistemasService } from '@services/api/sistemas.service';
import { ISistema, ISistemaStoreUpdate } from '@interfaces/models/sistema.interface';
import { HelperMessage } from '@shared/helpers/helper-message';

@Component({
  selector: 'app-mantenimiento-sistemas',
  imports: [FormsModule, InputText, IconField, InputIcon, Button, ButtonDirective, ToggleSwitch, FloatLabel, ConfirmDialog, Tag, Toolbar, TableModule, Dialog],
  providers: [ConfirmationService],
  templateUrl: './mantenimiento-sistemas.html',
  styleUrl: './mantenimiento-sistemas.scss',
})
export class MantenimientoSistemas implements OnInit {
  @ViewChild('dt') dt!: Table;

  private readonly svc     = inject(SistemasService);
  private readonly helperMessage = inject(HelperMessage);
  private readonly confirm = inject(ConfirmationService);
  private readonly permiso = inject(PermisoService);

  // ─── Permisos (gating fino) ─────────────────
  readonly canView   = computed(() => this.permiso.hasPermission('view', 'sistemas'));
  readonly canCreate = computed(() => this.permiso.hasPermission('create', 'sistemas'));
  readonly canUpdate = computed(() => this.permiso.hasPermission('update', 'sistemas'));
  readonly canDelete = computed(() => this.permiso.hasPermission('delete', 'sistemas'));

  // ─── Datos ────────────────────────────────
  data     = signal<ISistema[]>([]);
  editing: ISistema | null = null;

  // ─── UI ───────────────────────────────────
  loading    = signal(false);
  showDialog = signal(false);
  editMode   = signal(false);

  rows = 20;
  rowsPerPageOptions = [10, 20, 50];
  tableMessage = 'Mostrando {first} a {last} de {totalRecords} registros';

  // ─── Formulario del diálogo ────────────────
  form: ISistemaStoreUpdate = { codigo: '', descripcion: '', activo: true };

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.loading.set(true);
    this.svc.getIndex().subscribe({
      next: res => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al cargar los sistemas.');
        this.loading.set(false);
      },
    });
  }

  openNew(): void {
    this.editing = null;
    this.editMode.set(false);
    this.form = { codigo: '', descripcion: '', activo: true };
    this.showDialog.set(true);
  }

  openEdit(item: ISistema): void {
    this.editing = item;
    this.editMode.set(true);
    this.form = { codigo: item.codigo, descripcion: item.descripcion, activo: item.activo };
    this.showDialog.set(true);
  }

  save(): void {
    if (!this.form.codigo || !this.form.descripcion) {
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
        this.helperMessage.notifyHttpError(err, 'Error al guardar el sistema.');
        this.loading.set(false);
      },
    });
  }

  // Toggle de estado desde la tabla — protegido por canUpdate() en el template.
  cambiarEstado(item: ISistema): void {
    if (!item.id) return;
    const activo = !item.activo;
    this.loading.set(true);

    this.svc.update(item.id, { activo }).subscribe({
      next: res => {
        this.helperMessage.success(res.message ?? `Sistema ${activo ? 'activado' : 'inactivado'} correctamente.`);
        this.getData();
      },
      error: err => {
        this.helperMessage.notifyHttpError(err, 'Error al actualizar el estado del sistema.');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(item: ISistema): void {
    this.confirm.confirm({
      message: `¿Eliminar el sistema "${item.descripcion}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(item.id!),
    });
  }

  private delete(id: string): void {
    this.svc.delete(id).subscribe({
      next: res => {
        this.helperMessage.success(res.message ?? 'Sistema eliminado correctamente.');
        this.getData();
      },
      error: err => this.helperMessage.notifyHttpError(err, 'Error al eliminar el sistema.'),
    });
  }
}
