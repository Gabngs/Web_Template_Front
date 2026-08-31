import { ICrudApiService } from '@interfaces/base/crud.interface';
import { IRol, IRolStoreUpdate, IRolResponse } from '@interfaces/models/rol.interface';

export type IRolesService = ICrudApiService<IRol, IRolStoreUpdate, IRolResponse>;
