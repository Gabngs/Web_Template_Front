import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { URL_SIAW_USUARIOS, URL_SIAW_ROLES } from '@models/api-urls';
import { IUsuario, IUsuarioCreate, IUsuarioFiltros, IUsuariosResponse } from '@interfaces/models/usuario.interface';
import { IRol } from '@interfaces/models/rol.interface';
import { IUsuariosService } from '../interfaces/usuarios.service.interface';

@Injectable({ providedIn: 'root' })
export class UsuariosService implements IUsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url  = URL_SIAW_USUARIOS;

  // Espejo de App\Filters\SiawUsuariosFilters (allowedFilters: activo, rol_id;
  // columnSearch → search) + paginación (page/per_page/paginate), que no es
  // un filtro de negocio pero viaja en el mismo request — ver Filtros de Consulta.
  private buildParams(filters?: IUsuarioFiltros): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;

    if (filters['paginate'] !== undefined) params = params.set('paginate', String(filters['paginate']));
    if (filters['page'] !== undefined) params = params.set('page', String(filters['page']));
    if (filters['per_page'] !== undefined) params = params.set('per_page', String(filters['per_page']));
    if (filters['activo'] !== undefined && filters['activo'] !== null) params = params.set('activo', String(filters['activo']));
    if (filters['rol_id']) params = params.set('rol_id', String(filters['rol_id']));
    if (filters['search']) params = params.set('search', String(filters['search']));

    return params;
  }

  getIndex(filters?: IUsuarioFiltros): Observable<IUsuariosResponse> {
    return this.http.get<IUsuariosResponse>(this.url, { params: this.buildParams(filters) });
  }

  show(id: string): Observable<ApiResponse<IUsuario>> {
    return this.http.get<ApiResponse<IUsuario>>(`${this.url}/${id}`);
  }

  create(payload: IUsuarioCreate): Observable<ApiResponse<IUsuario>> {
    return this.http.post<ApiResponse<IUsuario>>(this.url, payload);
  }

  update(id: string, payload: Partial<IUsuarioCreate>): Observable<ApiResponse<IUsuario>> {
    return this.http.put<ApiResponse<IUsuario>>(`${this.url}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`);
  }

  getRoles(): Observable<ApiResponse<IRol[]>> {
    return this.http.get<ApiResponse<IRol[]>>(URL_SIAW_ROLES);
  }
}
