import { Observable } from 'rxjs';
import { ICrudApiService } from '@interfaces/base/crud.interface';
import { ApiResponse } from '@models/api-response.model';
import { IUsuario, IUsuarioCreate, IUsuariosResponse } from '@interfaces/models/usuario.interface';
import { IRol } from '@interfaces/models/rol.interface';

export interface IUsuariosService
  extends ICrudApiService<IUsuario, IUsuarioCreate, IUsuariosResponse> {
  getRoles(): Observable<ApiResponse<IRol[]>>;
}
