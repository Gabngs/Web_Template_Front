import { Observable } from 'rxjs';
import { ApiResponse, ApiPaginatedResponse } from '@models/api-response.model';
import {
  IContentPermiso,
  IContentPermisoCreate,
  IContentPermisoBulkCreate,
} from '@interfaces/models/content-permiso.interface';

export interface IPermisosService {
  getIndexPermisos(filters?: Record<string, unknown>): Observable<ApiResponse<IContentPermiso[]> | ApiPaginatedResponse<IContentPermiso>>;
  createPermiso(payload: IContentPermisoCreate): Observable<ApiResponse<IContentPermiso>>;
  updatePermiso(id: string, payload: Partial<IContentPermisoCreate>): Observable<ApiResponse<IContentPermiso>>;
  createPermisosBulk(payload: IContentPermisoBulkCreate): Observable<ApiResponse<IContentPermiso[]>>;
}
