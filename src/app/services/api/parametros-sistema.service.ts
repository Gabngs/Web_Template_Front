import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ApiPaginatedResponse } from '@models/api-response.model';
import { URL_SIAW_CONTENT_MODEL, URL_SIAW_CONTENT_PERMISOS } from '@models/api-urls';
import { IContentModel, IContentModelCreate } from '@interfaces/models/content-model.interface';
import {
  IContentPermiso,
  IContentPermisoCreate,
  IContentPermisoBulkCreate,
} from '@interfaces/models/content-permiso.interface';
import { IModelosService } from '../interfaces/modelos.service.interface';
import { IPermisosService } from '../interfaces/permisos.service.interface';

function buildParams(filters?: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params = params.set(key, String(val));
    });
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ParametrosSistemaService implements IModelosService, IPermisosService {
  private readonly http = inject(HttpClient);

  // ─── Modelos ────────────────────────────────
  getIndexModelos(filters?: Record<string, unknown>): Observable<ApiResponse<IContentModel[]> | ApiPaginatedResponse<IContentModel>> {
    return this.http.get<ApiResponse<IContentModel[]>>(URL_SIAW_CONTENT_MODEL, { params: buildParams(filters) });
  }

  createModelo(payload: IContentModelCreate): Observable<ApiResponse<IContentModel>> {
    return this.http.post<ApiResponse<IContentModel>>(URL_SIAW_CONTENT_MODEL, payload);
  }

  updateModelo(id: string, payload: Partial<IContentModelCreate>): Observable<ApiResponse<IContentModel>> {
    return this.http.put<ApiResponse<IContentModel>>(`${URL_SIAW_CONTENT_MODEL}/${id}`, payload);
  }

  // ─── Permisos ───────────────────────────────
  getIndexPermisos(filters?: Record<string, unknown>): Observable<ApiResponse<IContentPermiso[]> | ApiPaginatedResponse<IContentPermiso>> {
    return this.http.get<ApiResponse<IContentPermiso[]>>(URL_SIAW_CONTENT_PERMISOS, { params: buildParams(filters) });
  }

  createPermiso(payload: IContentPermisoCreate): Observable<ApiResponse<IContentPermiso>> {
    return this.http.post<ApiResponse<IContentPermiso>>(URL_SIAW_CONTENT_PERMISOS, payload);
  }

  updatePermiso(id: string, payload: Partial<IContentPermisoCreate>): Observable<ApiResponse<IContentPermiso>> {
    return this.http.put<ApiResponse<IContentPermiso>>(`${URL_SIAW_CONTENT_PERMISOS}/${id}`, payload);
  }

  createPermisosBulk(payload: IContentPermisoBulkCreate): Observable<ApiResponse<IContentPermiso[]>> {
    return this.http.post<ApiResponse<IContentPermiso[]>>(`${URL_SIAW_CONTENT_PERMISOS}/bulk`, payload);
  }
}
