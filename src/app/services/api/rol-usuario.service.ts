import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { URL_SIAW_ROL_USUARIO } from '@models/api-urls';
import { IRolUsuario, IRolUsuarioSync, IRolUsuarioResponse } from '@interfaces/models/rol-usuario.interface';

@Injectable({ providedIn: 'root' })
export class RolUsuarioService {
  private readonly http = inject(HttpClient);

  // Misma limitación que MenusService.getIndexPermisos(): usuario_id en DB
  // es el pkid interno, no el uuid — se trae todo el pivote con relaciones
  // y se filtra acá.
  getIndexPermisos(): Observable<IRolUsuarioResponse> {
    const params = new HttpParams().set('includes', 'usuario,rol');
    return this.http.get<IRolUsuarioResponse>(URL_SIAW_ROL_USUARIO, { params });
  }

  getRolesDeUsuario(usuarioId: string): Observable<IRolUsuario[]> {
    return this.getIndexPermisos().pipe(
      map((res: IRolUsuarioResponse) => res.data.filter((ru: IRolUsuario) => ru.usuario?.id === usuarioId)),
    );
  }

  // Reemplaza el set completo de roles del usuario — ver
  // SiawRolUsuarioController::sync en el backend.
  sync(payload: IRolUsuarioSync): Observable<IRolUsuarioResponse> {
    return this.http.post<IRolUsuarioResponse>(`${URL_SIAW_ROL_USUARIO}/sync`, payload);
  }
}
