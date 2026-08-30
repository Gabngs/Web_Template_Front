import { TreeNode } from 'primeng/api';
import { IMenu } from '@interfaces/models/menu.interface';

/**
 * Arma el árbol para p-treeTable a partir del listado plano de IMenu
 * (?include=sistema,parent). Mismo espíritu que construirArbolMenus() de
 * menu-tree.helper.ts, pero indexado por `parent?.id` (objeto relación) en
 * vez de `parent_id` plano — la Resource de siaw_menus no expone parent_id,
 * solo el objeto `parent` cargado.
 */
export function construirArbolMenusCrud(menus: IMenu[]): TreeNode<IMenu>[] {
  const nodos = new Map<string, TreeNode<IMenu>>();

  for (const menu of menus) {
    if (!menu.id) continue;
    nodos.set(menu.id, { key: menu.id, data: menu, children: [] });
  }

  const raices: TreeNode<IMenu>[] = [];

  for (const menu of menus) {
    if (!menu.id) continue;
    const nodo = nodos.get(menu.id)!;
    const padre = menu.parent?.id ? nodos.get(menu.parent.id) : undefined;
    if (padre) {
      padre.children!.push(nodo);
    } else {
      raices.push(nodo);
    }
  }

  const ordenarRecursivo = (lista: TreeNode<IMenu>[]): void => {
    lista.sort((a, b) => (a.data?.orden ?? 0) - (b.data?.orden ?? 0));
    lista.forEach(nodo => ordenarRecursivo(nodo.children ?? []));
  };
  ordenarRecursivo(raices);

  return raices;
}

/**
 * Sangría por profundidad para el <p-select> plano de "menú padre" en el
 * diálogo de crear/editar — evita depender de un p-treeSelect.
 */
export function menusConSangria(menus: IMenu[]): { id: string; label: string }[] {
  const porId = new Map(menus.filter(m => m.id).map(m => [m.id as string, m]));

  const profundidad = (menu: IMenu): number => {
    let nivel = 0;
    let actual = menu.parent?.id ? porId.get(menu.parent.id) : undefined;
    while (actual) {
      nivel++;
      actual = actual.parent?.id ? porId.get(actual.parent.id) : undefined;
    }
    return nivel;
  };

  return menus
    .filter(m => m.id && m.titulo)
    .map(m => ({ id: m.id as string, label: `${'—'.repeat(profundidad(m))} ${m.titulo}`.trim() }));
}
