import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';

export interface IRol extends IModelBase {
  name?:        string;
  slug?:        string;
  guard_name?:  string;
  descripcion?: string;
}

// Embebida como FK dentro de otro I{Modelo} (ej. IUsuario.rol) — coincide
// exacto con SiawRolRelationResource del backend.
export interface IRolRelation {
  id:   string;
  name: string;
  slug: string;
}

// Forma mínima — para dropdowns/selects
export interface IRolTiny {
  id:   string;
  name: string;
}

export interface IRolStoreUpdate {
  name?:        string;
  slug?:        string;
  guard_name?:  string;
  descripcion?: string;
  activo?:      boolean;
}

export interface IRolResponse {
  status:  number;
  message: string;
  data:    IRol[];
  meta?:   IModelBasePaginate;
}

export interface IRolSingleResponse {
  status:  number;
  message: string;
  data:    IRol;
}
