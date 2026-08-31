import { Observable } from 'rxjs';
import { ApiResponse, ApiPaginatedResponse } from '@models/api-response.model';
import { IContentModel, IContentModelCreate } from '@interfaces/models/content-model.interface';

export interface IModelosService {
  getIndexModelos(filters?: Record<string, unknown>): Observable<ApiResponse<IContentModel[]> | ApiPaginatedResponse<IContentModel>>;
  createModelo(payload: IContentModelCreate): Observable<ApiResponse<IContentModel>>;
  updateModelo(id: string, payload: Partial<IContentModelCreate>): Observable<ApiResponse<IContentModel>>;
}
