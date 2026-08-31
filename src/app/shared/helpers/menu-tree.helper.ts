import { MenuItem } from 'primeng/api';
import { ISesionMenu } from '@interfaces/models/sesion-menu.interface';

export interface IMenuNode extends ISesionMenu {
  hijos: IMenuNode[];
}

export interface IMenuBusqueda extends ISesionMenu {
  parentTitulo: string | null;
}


export function construirArbolMenus(menus: ISesionMenu[]): IMenuNode[] {
  const nodos = new Map<string, IMenuNode>();
  const raices: IMenuNode[] = [];

  for (const menu of menus) {
    nodos.set(menu.id, { ...menu, hijos: [] });
  }

  // Recorre el Map (únicos por id), no el array crudo — si el backend
  // devuelve el mismo menú más de una vez (ej. matchea más de un permiso
  // del rol en el whereHas de armarPaqueteSesion()), iterar el array
  // original empujaría el mismo nodo dos veces al mismo padre.
  for (const nodo of nodos.values()) {
    if (!nodo.parent_id) {
      raices.push(nodo);
      continue;
    }
    const padre = nodos.get(nodo.parent_id);
    if (padre) {
      padre.hijos.push(nodo);
    }
    // Si tiene parent_id pero el padre no está en la lista (ej. el backend lo
    // filtró por `activo=false`), el nodo se DESCARTA — no se promueve a raíz.
    // Su subárbol queda excluido solo, porque este nodo huérfano nunca se
    // enlaza a `raices`.
  }

  const ordenarRecursivo = (lista: IMenuNode[]): void => {
    lista.sort((a, b) => a.orden - b.orden);
    lista.forEach(nodo => ordenarRecursivo(nodo.hijos));
  };
  ordenarRecursivo(raices);

  const podarVacios = (lista: IMenuNode[]): IMenuNode[] =>
    lista
      .map(nodo => ({ ...nodo, hijos: podarVacios(nodo.hijos) }))
      .filter(nodo => nodo.ruta !== null || nodo.hijos.length > 0);

  return podarVacios(raices);
}

/**
 * Convierte el árbol de IMenuNode a MenuItem[] de PrimeNG (recursivo,
 * profundidad ilimitada). Consumido por el árbol recursivo propio del
 * sidebar (AppMenuitem, layout de Sakai — ver shared/layout/shell).
 */
export function menusAPrimeNgItems(nodos: IMenuNode[]): MenuItem[] {
  return nodos.map(nodo => ({
    label:      nodo.titulo,
    icon:       nodo.nombre_icon ? `pi pi-${nodo.nombre_icon}` : undefined,
    routerLink: rutaAbsoluta(nodo.ruta),
    items:      nodo.hijos.length ? menusAPrimeNgItems(nodo.hijos) : undefined,
  }));
}

// El <a [routerLink]> del sidebar vive dentro de AdminShell (no de la página
// con la ruta), así que una ruta sin "/" inicial se resuelve como RELATIVA
// a /dashboard en vez de absoluta — el resultado no matchea ninguna ruta
// registrada, ni siquiera el wildcard "**" (que solo atrapa rutas que sí
// entraron al árbol de /dashboard), y termina expulsando al usuario a la
// wildcard global de app.routes.ts (la web pública). Se normaliza acá como
// red de seguridad, aunque el form de Mantenimiento de Menús ya la guarda
// bien — cubre datos viejos o cargados por otra vía (seeder, importación).
function rutaAbsoluta(ruta: string | null | undefined): string | undefined {
  if (!ruta) return undefined;
  return ruta.startsWith('/') ? ruta : `/${ruta}`;
}

/**
 * Lista PLANA (no árbol) de menús navegables (con `ruta`), para el buscador
 * Ctrl+K. Cada item lleva el título de su padre como referencia visual.
 */
export function menusPlanosNavegables(menus: ISesionMenu[]): IMenuBusqueda[] {
  const porId = new Map(menus.map(m => [m.id, m]));

  return menus
    .filter(m => !!m.ruta)
    .map(m => ({
      ...m,
      parentTitulo: m.parent_id ? (porId.get(m.parent_id)?.titulo ?? null) : null,
    }));
}
