import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { IRolRelation } from './rol.interface';
import { IContentPermisoRelation } from './content-permiso.interface';

// Entidad de siaw_permiso_rol — pivot que define qué permisos tiene cada rol.
export interface IPermisoRol extends IModelBase {
  rol?:     IRolRelation | null;
  permiso?: IContentPermisoRelation | null;
}

// Payload de POST /siaw_permiso_rol/sync — reemplaza el set completo de
// permisos del rol (estado FINAL del picklist, no un diff).
export interface IPermisoRolSync {
  rol_id:      string;
  permiso_ids: string[];
}

export interface IPermisoRolResponse {
  status:  number;
  message: string;
  data:    IPermisoRol[];
  meta?:   IModelBasePaginate;
}
