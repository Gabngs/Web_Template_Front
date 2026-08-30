import { IContentModelRelation } from '@interfaces/models/content-model.interface';

// Embebida como FK dentro de otro I{Modelo} (ej. IMenuPermiso.permiso) —
// coincide exacto con SiawContentPermisosRelationResource del backend.
export interface IContentPermisoRelation {
  id:       string;
  codename: string;
}

// Forma mínima — para el picklist de "permisos disponibles"
export interface IContentPermisoTiny {
  id:       string;
  codename: string;
  desc:     string;
}

export interface IContentPermiso {
  id:            string;
  codename:      string;
  desc:          string;
  content_model: IContentModelRelation;
  created_at:    string;
  updated_at:    string;
}

export interface IContentPermisoCreate {
  content_model_id: string;
  codename:         string;
  desc:             string;
}

export interface IContentPermisoUpdate {
  content_model_id?: string;
  codename?:         string;
  desc?:             string;
}

export interface IContentPermisoBulkCreate {
  content_model_id: string;
  permisos: { codename: string; desc: string }[];
}

export interface IContentPermisoResponse {
  status:  number;
  message: string;
  data:    IContentPermiso[];
}
export interface IContentPermisoSingleResponse {
  status:  number;
  message: string;
  data:    IContentPermiso;
}