import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { IUsuarioRelation } from './usuario.interface';
import { IContentPermisoRelation } from './content-permiso.interface';

// Entidad de siaw_permiso_usuario — override puntual de permisos por
// usuario, por fuera de lo que le da su rol (ver IPermisoRol).
export interface IPermisoUsuario extends IModelBase {
  usuario?:   IUsuarioRelation | null;
  permiso?:   IContentPermisoRelation | null;
  permitido?: boolean;
}

// Payload de POST /siaw_permiso_usuario/sync — reemplaza el set completo de
// permisos CONCEDIDOS (permitido=true) del usuario (estado FINAL del
// picklist). No toca denegaciones explícitas — el backend las deja aparte.
export interface IPermisoUsuarioSync {
  usuario_id:  string;
  permiso_ids: string[];
}

export interface IPermisoUsuarioResponse {
  status:  number;
  message: string;
  data:    IPermisoUsuario[];
  meta?:   IModelBasePaginate;
}
