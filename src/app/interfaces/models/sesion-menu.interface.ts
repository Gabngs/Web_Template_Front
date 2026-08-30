// Forma reducida que arma AuthService::armarPaqueteSesion() en el backend
// (GET /auth/me, /auth/permisos) — NO es la entidad completa de siaw_menus
// (esa es IMenu en menu.interface.ts, para el CRUD de Mantenimiento de
// Menús). sistema_id/parent_id vienen planos (UUID), sin clave ni relaciones
// anidadas, porque el backend ya remapea el árbol para el sidebar.
export interface ISesionMenu {
  id:           string;
  sistema_id:   string;
  parent_id:    string | null;
  titulo:       string;
  descripcion:  string | null;
  ruta:         string | null;
  nombre_icon:  string | null;
  orden:        number;
  dashboard:    boolean;
}
