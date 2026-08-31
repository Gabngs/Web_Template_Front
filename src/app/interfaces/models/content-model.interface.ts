export interface IContentModel {
  id:             string;
  app_label:      string;
  app_model:      string;
  nombre_display: string;
  created_at:     string;
  updated_at:     string;
}
export interface IContentModelRelation{
  id:             string;
  app_label:      string;
  app_model:      string;
  nombre_display: string;
}
export interface IContentModelCreate {
  app_label:      string;
  app_model:      string;
  nombre_display: string;
}
export interface IContentModelUpdate {
  app_label?:      string;
  app_model?:      string;
  nombre_display?: string;
}

export interface IContentModelResponse{
  status:  number;
  message: string;
  data:    IContentModel[];
}
export interface IContentModelSingleResponse{
  status:  number;
  message: string;
  data:    IContentModel;
}
