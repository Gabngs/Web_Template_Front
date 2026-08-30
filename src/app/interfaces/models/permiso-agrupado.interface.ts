import { IContentPermiso } from '@interfaces/models/content-permiso.interface';

export interface IPermisoAgrupado {
  modeloId: string;
  label: string;
  permisos: IContentPermiso[];
}

export interface IPermisoTemplate {
  name: string;
  codename: string;
  checked: boolean;
  disabled: boolean;
}
