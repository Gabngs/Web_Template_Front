import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { URL_SIAW_PERMISO_USUARIO } from '@models/api-urls';
import { IPermisoUsuario, IPermisoUsuarioSync, IPermisoUsuarioResponse } from '@interfaces/models/permiso-usuario.interface';

@Injectable({ providedIn: 'root' })
export class PermisoUsuarioService {
  private readonly http = inject(HttpClient);

  // Misma limitación que MenusService.getIndexPermisos(): usuario_id en DB
  // es el pkid interno, no el uuid — se trae todo el pivote con relaciones
  // y se filtra acá.
  getIndexPermisos(): Observable<IPermisoUsuarioResponse> {
    const params = new HttpParams().set('includes', 'usuario,permiso');
    return this.http.get<IPermisoUsuarioResponse>(URL_SIAW_PERMISO_USUARIO, { params });
  }

  getPermisosDeUsuario(usuarioId: string): Observable<IPermisoUsuario[]> {
    return this.getIndexPermisos().pipe(
      map((res: IPermisoUsuarioResponse) => res.data.filter((pu: IPermisoUsuario) => pu.usuario?.id === usuarioId)),
    );
  }

  // Reemplaza el set completo de permisos CONCEDIDOS (permitido=true) del
  // usuario — ver SiawPermisoUsuarioController::sync en el backend.
  sync(payload: IPermisoUsuarioSync): Observable<IPermisoUsuarioResponse> {
    return this.http.post<IPermisoUsuarioResponse>(`${URL_SIAW_PERMISO_USUARIO}/sync`, payload);
  }
}
