import { IAuditUser } from './audit-user.interface';


export interface IModelBase {
  id?:             string;
  activo?:         boolean;
  created_by_id?:  IAuditUser | null;
  updated_by_id?:  IAuditUser | null;
  deleted_by_id?:  IAuditUser | null;
  created_at?:     string;
  updated_at?:     string;
  deleted_at?:     string | null;
}

export interface IModelBasePaginate {
  current_page: number;
  per_page:     number;
  total:        number;
  last_page:    number;
  from:         number | null;
  to:           number | null;
}
