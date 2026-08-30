import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { IRolRelation } from './rol.interface';
import { IUsuarioRelation } from './usuario.interface';

// Entidad de siaw_rol_usuario — pivot que define qué roles tiene cada
// usuario. No confundir con IUsuario.rol (el rol_id único que hoy sigue
// usando AuthService para resolver permisos) — este pivote es la
// asignación multi-rol, todavía no consumida por la resolución de permisos.
export interface IRolUsuario extends IModelBase {
  usuario?: IUsuarioRelation | null;
  rol?:     IRolRelation | null;
}

// Payload de POST /siaw_rol_usuario/sync — reemplaza el set completo de
// roles del usuario (estado FINAL del picklist, no un diff).
export interface IRolUsuarioSync {
  usuario_id: string;
  rol_ids:    string[];
}

export interface IRolUsuarioResponse {
  status:  number;
  message: string;
  data:    IRolUsuario[];
  meta?:   IModelBasePaginate;
}
