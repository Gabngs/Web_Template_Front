import { IApiSuccess } from './shared.interface';

export interface IExample {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IExampleShow extends IApiSuccess<IExample> {}
export interface IExampleResponse extends IApiSuccess<IExample[]> {}
export interface IExampleCreate {
  name: string;
}
export interface IExampleUpdate extends Partial<IExampleCreate> {}
export interface IExampleFilters {
  name?: string;
}

export type IExampleSingle = IApiSuccess<IExample>;
export type IExampleList = IApiSuccess<IExample[]>;
