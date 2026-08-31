import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { URL_SIAW_PERMISO_ROL } from '@models/api-urls';
import { IPermisoRol, IPermisoRolSync, IPermisoRolResponse } from '@interfaces/models/permiso-rol.interface';

@Injectable({ providedIn: 'root' })
export class PermisoRolService {
  private readonly http = inject(HttpClient);

  // Misma limitación que MenusService.getIndexPermisos(): rol_id en DB es el
  // pkid interno, no el uuid — no hay filtro server-side confiable por uuid,
  // así que se trae todo el pivote con relaciones y se filtra acá.
  getIndexPermisos(): Observable<IPermisoRolResponse> {
    const params = new HttpParams().set('includes', 'rol,permiso');
    return this.http.get<IPermisoRolResponse>(URL_SIAW_PERMISO_ROL, { params });
  }

  getPermisosDeRol(rolId: string): Observable<IPermisoRol[]> {
    return this.getIndexPermisos().pipe(
      map((res: IPermisoRolResponse) => res.data.filter((pr: IPermisoRol) => pr.rol?.id === rolId)),
    );
  }

  // Reemplaza el set completo de permisos del rol — ver
  // SiawPermisoRolController::sync en el backend. El picklist manda el
  // estado final (Asignados), no un diff — una sola request en vez de
  // calcular altas/bajas y disparar N requests en paralelo.
  sync(payload: IPermisoRolSync): Observable<IPermisoRolResponse> {
    return this.http.post<IPermisoRolResponse>(`${URL_SIAW_PERMISO_ROL}/sync`, payload);
  }
}
