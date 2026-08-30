import { IRolRelation } from './rol.interface';
import { ISesionMenu } from './sesion-menu.interface';

export interface IPermisosSesion {
  rol:      IRolRelation | null;
  permisos: string[];
  menus:    ISesionMenu[];
}
