import { Observable } from 'rxjs';
import { ApiResponse } from '@models/api-response.model';

// TResponse es el I{Modelo}Response propio de la entidad (data/meta) — ver
// "Interfaz de Modulo" en el estándar. Un solo TStoreUpdate para create/update.
export interface ICrudApiService<T, TStoreUpdate = Partial<T>, TResponse = ApiResponse<T[]>> {
  getIndex(filters?: Record<string, unknown>): Observable<TResponse>;
  show(id: string): Observable<ApiResponse<T>>;
  create(payload: TStoreUpdate): Observable<ApiResponse<T>>;
  update(id: string, payload: TStoreUpdate): Observable<ApiResponse<T>>;
  delete(id: string): Observable<ApiResponse<null>>;
}
