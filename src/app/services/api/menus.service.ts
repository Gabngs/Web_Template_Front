import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';
import { URL_SIAW_MENUS, URL_SIAW_MENU_PERMISO } from '@models/api-urls';
import { IMenu, IMenuStoreUpdate, IMenuResponse, IMenuSingleResponse } from '@interfaces/models/menu.interface';
import {
  IMenuPermiso,
  IMenuPermisoStoreUpdate,
  IMenuPermisoResponse,
  IMenuPermisoSingleResponse,
} from '@interfaces/models/menu-permiso.interface';
@Injectable({ providedIn: 'root' })
export class MenusService {
  private readonly http = inject(HttpClient);

  // ─── siaw_menus ─────────────────────────────
  // Sin paginar — el árbol se arma client-side, necesita todos los nodos.
  // includes=sistema,parent (plural — así lo lee FiltersDTO::buildFromRequest()
  // en essa/api-tool-kit; "include" en singular no matchea nada y la relación
  // queda sin cargar en silencio, ver IncludesHandler). No "hijos": el árbol se
  // reconstruye con menu-crud-tree.helper.ts a partir de parent, no hace falta
  // pedirlo aparte.
  getIndex(): Observable<IMenuResponse> {
    const params = new HttpParams().set('includes', 'sistema,parent');
    return this.http.get<IMenuResponse>(URL_SIAW_MENUS, { params });
  }

  show(id: string): Observable<IMenuSingleResponse> {
    return this.http.get<IMenuSingleResponse>(`${URL_SIAW_MENUS}/${id}`);
  }

  create(payload: IMenuStoreUpdate): Observable<IMenuSingleResponse> {
    return this.http.post<IMenuSingleResponse>(URL_SIAW_MENUS, payload);
  }

  update(id: string, payload: IMenuStoreUpdate): Observable<IMenuSingleResponse> {
    return this.http.put<IMenuSingleResponse>(`${URL_SIAW_MENUS}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${URL_SIAW_MENUS}/${id}`);
  }

  // ─── siaw_menu_permiso ──────────────────────
  // No hay endpoint "permisos de este menú" ni filtro server-side confiable
  // por uuid (menu_id en DB es el pkid interno) — se trae todo el pivote con
  // las relaciones cargadas y se filtra acá, ver Mantenimiento de Menús en
  // el estándar (Obsidian) para el detalle de esta limitación del backend.
  getIndexPermisos(): Observable<IMenuPermisoResponse> {
    const params = new HttpParams().set('includes', 'menu,permiso');
    return this.http.get<IMenuPermisoResponse>(URL_SIAW_MENU_PERMISO, { params });
  }

  // Filas del pivote (con su propio `id`, necesario para desvincularPermiso)
  // ya filtradas por menú — la vista solo necesita el subset, pero el fetch
  // sigue siendo "traer todo" por la limitación de arriba.
  getPermisosDeMenu(menuId: string): Observable<IMenuPermiso[]> {
    return this.getIndexPermisos().pipe(
      map((res: IMenuPermisoResponse) => res.data.filter((mp: IMenuPermiso) => mp.menu?.id === menuId)),
    );
  }

  vincularPermiso(payload: IMenuPermisoStoreUpdate): Observable<IMenuPermisoSingleResponse> {
    return this.http.post<IMenuPermisoSingleResponse>(URL_SIAW_MENU_PERMISO, payload);
  }

  desvincularPermiso(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${URL_SIAW_MENU_PERMISO}/${id}`);
  }
}
