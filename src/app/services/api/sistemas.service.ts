import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { URL_SIAW_SISTEMAS } from '@models/api-urls';
import { ISistema, ISistemaStoreUpdate, ISistemaResponse, ISistemaSingleResponse } from '@interfaces/models/sistema.interface';
import { ISistemasService } from '../interfaces/sistemas.service.interface';

@Injectable({ providedIn: 'root' })
export class SistemasService implements ISistemasService {
  private readonly http = inject(HttpClient);

  // `filters` acepta { codigo: 'GSP' } — usado por PermisoService para
  // resolver el id del sistema propio (ver CODIGO_SISTEMA_PROPIO). La
  // interfaz ICrudApiService ya declaraba `filters` como opcional; esta
  // implementación no lo aceptaba, lo cual rompía la firma real del
  // contrato (detectado al compilar tras agregar el uso en PermisoService).
  getIndex(filters?: Record<string, unknown>): Observable<ISistemaResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters ?? {})) {
      if (value !== undefined && value !== null) params = params.set(key, String(value));
    }
    return this.http.get<ISistemaResponse>(URL_SIAW_SISTEMAS, { params });
  }

  show(id: string): Observable<ApiResponse<ISistema>> {
    return this.http.get<ISistemaSingleResponse>(`${URL_SIAW_SISTEMAS}/${id}`);
  }

  create(payload: ISistemaStoreUpdate): Observable<ApiResponse<ISistema>> {
    return this.http.post<ISistemaSingleResponse>(URL_SIAW_SISTEMAS, payload);
  }

  update(id: string, payload: ISistemaStoreUpdate): Observable<ApiResponse<ISistema>> {
    return this.http.put<ISistemaSingleResponse>(`${URL_SIAW_SISTEMAS}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${URL_SIAW_SISTEMAS}/${id}`);
  }
}
