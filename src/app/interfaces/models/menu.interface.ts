import { IModelBase, IModelBasePaginate } from '@interfaces/shared/model-base.interface';
import { ISistemaRelation } from './sistema.interface';

// Entidad completa de siaw_menus (SiawMenusResource) — para el CRUD de
// Mantenimiento de Menús. No confundir con ISesionMenu (sesion-menu.interface.ts),
// la forma reducida que arma el backend para el sidebar/login.
export interface IMenu extends IModelBase {
  titulo?:      string;
  descripcion?: string | null;
  ruta?:        string | null;
  nombre_icon?: string | null;
  orden?:       number;
  dashboard?:   boolean;
  clave?:       string | null;            // solo lectura, lo calcula el backend
  sistema?:     ISistemaRelation | null;   // requiere ?include=sistema
  parent?:      IMenuRelation | null;      // requiere ?include=parent
  hijos?:       IMenuRelation[];           // requiere ?include=hijos
}

// Embebida como FK dentro de otro I{Modelo} (sistema/parent/hijos de IMenu,
// menu de IMenuPermiso)
export interface IMenuRelation {
  id:          string;
  titulo:      string;
  ruta:        string | null;
  nombre_icon: string | null;
  orden:       number;
}

// Forma mínima — para el select de "menú padre"
export interface IMenuTiny {
  id:     string;
  titulo: string;
}

export interface IMenuStoreUpdate {
  sistema_id?:  string;
  parent_id?:   string | null;
  titulo?:      string;
  descripcion?: string | null;
  ruta?:        string | null;
  nombre_icon?: string | null;
  orden?:       number;
  activo?:      boolean;
  dashboard?:   boolean;
}

export interface IMenuResponse {
  status:  number;
  message: string;
  data:    IMenu[];
  meta?:   IModelBasePaginate;
}

export interface IMenuSingleResponse {
  status:  number;
  message: string;
  data:    IMenu;
}
