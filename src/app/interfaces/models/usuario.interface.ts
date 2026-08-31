import { IRolRelation } from './rol.interface';
import { IModelBasePaginate } from '@interfaces/shared/model-base.interface';
export interface IUsuario {
  id:                     string;
  nombre:                 string;
  apellidos:              string | null;
  email:                  string;
  codigo:                 string;
  activo:                 boolean;
  debe_cambiar_password:  boolean;
  rol:                    IRolRelation | null;
  created_at:             string;
  updated_at:             string;
}

// Embebida como FK dentro de otro I{Modelo} (ej. IPermisoUsuario.usuario) —
// coincide exacto con SiawUsuarioRelationResource del backend.
export interface IUsuarioRelation {
  id:     string;
  nombre: string;
  email:  string;
  codigo: string;
}

export interface IUsuarioCreate {
  nombre:     string;
  apellidos?: string;
  email?:      string;
  rol_id?:    string;
  activo?:    boolean;
}

export interface IUsuarioFiltros {
  activo?: boolean;
  rol_id?: string;
  search?: string;
  paginate?: boolean;
  page?: number;
  per_page?: number;

}
export interface IUsuariosResponse{
  status: number;
  message: string;
  data: IUsuario[];
  meta?: IModelBasePaginate;
}

export interface IUsuarioSingleResponse {
  status: number;
  message: string;
  data: IUsuario;
}