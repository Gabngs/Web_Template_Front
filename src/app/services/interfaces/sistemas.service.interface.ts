import { ICrudApiService } from '@interfaces/base/crud.interface';
import { ISistema, ISistemaStoreUpdate, ISistemaResponse } from '@interfaces/models/sistema.interface';

export type ISistemasService = ICrudApiService<ISistema, ISistemaStoreUpdate, ISistemaResponse>;
