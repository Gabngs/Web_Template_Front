import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { IMenuRelation } from './menu.interface';

export interface ISistema extends IModelBase {
  codigo?:      string;
  descripcion?: string;
  menus?:       IMenuRelation[];   // solo poblado en show(), el index no hace eager-load
}

// Embebida como FK dentro de otro I{Modelo} (ej. IMenu.sistema)
export interface ISistemaRelation {
  id:          string;
  codigo:      string;
  descripcion: string;
}

// Forma mínima — para el filtro/dropdown de sistema
export interface ISistemaTiny {
  id:          string;
  descripcion: string;
}

export interface ISistemaStoreUpdate {
  codigo?:      string;
  descripcion?: string;
  activo?:      boolean;
}

export interface ISistemaResponse {
  status:  number;
  message: string;
  data:    ISistema[];
  meta?:   IModelBasePaginate;
}

export interface ISistemaSingleResponse {
  status:  number;
  message: string;
  data:    ISistema;
}
