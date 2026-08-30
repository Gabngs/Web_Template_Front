import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { IMenuRelation } from './menu.interface';
import { IContentPermisoRelation } from './content-permiso.interface';

// Entidad de siaw_menu_permiso — pivot que vincula un menú con el permiso
// can_view_* que lo desbloquea en el sidebar.
export interface IMenuPermiso extends IModelBase {
  menu?:    IMenuRelation | null;
  permiso?: IContentPermisoRelation | null;
}

export interface IMenuPermisoStoreUpdate {
  menu_id?:    string;
  permiso_id?: string;
}

export interface IMenuPermisoResponse {
  status:  number;
  message: string;
  data:    IMenuPermiso[];
  meta?:   IModelBasePaginate;
}

export interface IMenuPermisoSingleResponse {
  status:  number;
  message: string;
  data:    IMenuPermiso;
}
