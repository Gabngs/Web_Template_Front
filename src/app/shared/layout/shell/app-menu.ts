import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app-menuitem';
import { PermisoService } from '@services/api/permiso.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model(); track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    private readonly permiso = inject(PermisoService);

    // Árbol de menús del backend: siaw_menus → construirArbolMenus → menusArbol,
    // ya en forma MenuItem[] de PrimeNG (label / icon / routerLink / items).
    // Reemplaza el `model` hardcodeado que traía Sakai.
    readonly model = computed<MenuItem[]>(() => this.permiso.menusArbol());
}
