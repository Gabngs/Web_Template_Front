import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { URL_SIAW_ROLES } from '@models/api-urls';
import { IRol, IRolStoreUpdate, IRolResponse, IRolSingleResponse } from '@interfaces/models/rol.interface';
import { IRolesService } from '../interfaces/roles.service.interface';

@Injectable({ providedIn: 'root' })
export class RolesService implements IRolesService {
  private readonly http = inject(HttpClient);

  getIndex(): Observable<IRolResponse> {
    return this.http.get<IRolResponse>(URL_SIAW_ROLES);
  }

  show(id: string): Observable<ApiResponse<IRol>> {
    return this.http.get<IRolSingleResponse>(`${URL_SIAW_ROLES}/${id}`);
  }

  create(payload: IRolStoreUpdate): Observable<ApiResponse<IRol>> {
    return this.http.post<IRolSingleResponse>(URL_SIAW_ROLES, payload);
  }

  update(id: string, payload: IRolStoreUpdate): Observable<ApiResponse<IRol>> {
    return this.http.put<IRolSingleResponse>(`${URL_SIAW_ROLES}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${URL_SIAW_ROLES}/${id}`);
  }
}
