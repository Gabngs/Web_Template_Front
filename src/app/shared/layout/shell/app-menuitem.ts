import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { LayoutService } from './layout.service';
import { filter } from 'rxjs/operators';

// Umbral por cantidad de hijos (no por profundidad): un grupo raíz con menos
// de 4 hijos se muestra siempre expandido (encontrarlos de un vistazo vale más
// que un click); con 4 o más se vuelve un acordeón clickeable para no saturar
// el sidebar. Regla portada del sidebar-menu-item anterior.
const UMBRAL_ACORDEON = 4;

@Component({
    selector: '[app-menuitem]',
    imports: [CommonModule, RouterModule, RippleModule],
    template: `
        @if (root() && isVisible() && !esRootHoja()) {
            @if (esRootColapsable()) {
                <button type="button" class="layout-menuitem-root-text layout-menuitem-root-toggle" (click)="toggleRoot()">
                    <span>{{ item().label }}</span>
                    <i class="pi pi-angle-down layout-submenu-toggler" [class.rotated]="abierto()"></i>
                </button>
            } @else {
                <div class="layout-menuitem-root-text">{{ item().label }}</div>
            }
        }
        @if ((!hasRouterLink() || hasChildren()) && isVisible()) {
            <a [attr.href]="item().url" (click)="itemClick($event)" [ngClass]="item().class" [attr.target]="item().target" tabindex="0" pRipple>
                <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item().label }}</span>
                @if (hasChildren()) {
                    <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
                }
            </a>
        }
        @if (hasRouterLink() && !hasChildren() && isVisible()) {
            <a
                (click)="itemClick($event)"
                [ngClass]="item().class"
                [routerLink]="item().routerLink"
                routerLinkActive="active-route"
                [routerLinkActiveOptions]="item().routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
                [fragment]="item().fragment"
                [queryParamsHandling]="item().queryParamsHandling"
                [preserveFragment]="item().preserveFragment"
                [skipLocationChange]="item().skipLocationChange"
                [replaceUrl]="item().replaceUrl"
                [state]="item().state"
                [queryParams]="item().queryParams"
                [attr.target]="item().target"
                tabindex="0"
                pRipple
            >
                <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item().label }}</span>
                @if (hasChildren()) {
                    <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
                }
            </a>
        }
        @if (mostrarSubmenu()) {
            <ul [animate.enter]="initialized() ? 'p-submenu-enter' : null" [animate.leave]="'p-submenu-leave'" [class.layout-root-submenulist]="root()">
                @for (child of item().items; track child?.label) {
                    <li app-menuitem [item]="child" [parentPath]="fullPath()" [root]="false" [class]="child['badgeClass']"></li>
                }
            </ul>
        }
    `,
    host: {
        '[class.active-menuitem]': 'isActive()',
        '[class.layout-root-menuitem]': 'root()',
        '[class.layout-root-menuitem-hoja]': 'esRootHoja()'
    },
    styles: [
        `
            /* Grupo raíz colapsable (>= 4 hijos): el label pasa a ser un botón */
            .layout-menuitem-root-toggle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                border: 0;
                background: transparent;
                padding: 0;
                cursor: pointer;
                font: inherit;
                letter-spacing: inherit;
            }
            .layout-menuitem-root-toggle .layout-submenu-toggler {
                font-size: 75%;
                transition: transform var(--element-transition-duration);
            }
            .layout-menuitem-root-toggle .layout-submenu-toggler.rotated {
                transform: rotate(-180deg);
            }

            .p-submenu-enter {
                animation: p-animate-submenu-expand 450ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
            }

            .p-submenu-leave {
                animation: p-animate-submenu-collapse 450ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
            }

            @keyframes p-animate-submenu-expand {
                from {
                    max-height: 0;
                    overflow: hidden;
                }
                to {
                    max-height: 1000px;
                    overflow: visible;
                }
            }

            @keyframes p-animate-submenu-collapse {
                from {
                    max-height: 1000px;
                    overflow: hidden;
                }
                to {
                    max-height: 0;
                    overflow: hidden;
                }
            }
        `
    ]
})
export class AppMenuitem implements OnInit {
    layoutService = inject(LayoutService);

    router = inject(Router);

    item = input<any>(null);

    root = input<boolean>(false);

    parentPath = input<string | null>(null);

    isVisible = computed(() => this.item()?.visible !== false);

    hasChildren = computed(() => this.item()?.items && this.item()?.items.length > 0);

    hasRouterLink = computed(() => !!this.item()?.routerLink);

    // Grupo raíz con >= 4 hijos → acordeón clickeable (se puede ocultar).
    esRootColapsable = computed(() => this.root() && (this.item()?.items?.length ?? 0) >= UMBRAL_ACORDEON);

    // Menú raíz que ES un destino navegable (tiene ruta y NO tiene hijos), ej.
    // "Dashboard". No es una sección: se renderiza su <a> como ítem normal en
    // vez del encabezado no clickeable. Sakai por defecto oculta el <a> de todo
    // root (`.layout-root-menuitem > a { display:none }`), lo que dejaba estos
    // menús sin forma de navegar — ver _menu.scss (.layout-root-menuitem-hoja).
    esRootHoja = computed(() => this.root() && this.hasRouterLink() && !this.hasChildren());

    // Estado abierto/cerrado — solo aplica a los grupos raíz colapsables.
    abierto = signal(false);

    // Cuándo se muestra el <ul> de hijos:
    //  - raíz NO colapsable  → siempre (sección fija, comportamiento Sakai)
    //  - raíz colapsable      → según abierto()
    //  - no raíz              → cuando su rama está activa
    mostrarSubmenu = computed(() => {
        if (!this.hasChildren() || !this.isVisible()) return false;
        if (this.root()) return !this.esRootColapsable() || this.abierto();
        return this.isActive();
    });

    fullPath = computed(() => {
        const itemPath = this.item()?.path;
        if (!itemPath) return this.parentPath();
        const parent = this.parentPath();
        if (parent && !itemPath.startsWith(parent)) {
            return parent + itemPath;
        }
        return itemPath;
    });

    isActive = computed(() => {
        const activePath = this.layoutService.layoutState().activePath;
        if (this.item()?.path) {
            return activePath?.startsWith(this.fullPath() ?? '') ?? false;
        }
        return false;
    });

    initialized = signal<boolean>(false);

    constructor() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (this.item()?.routerLink) {
                this.updateActiveStateFromRoute();
            }
        });
    }

    ngOnInit() {
        if (this.item()?.routerLink) {
            this.updateActiveStateFromRoute();
        }
        // Acordeón raíz: arranca abierto si alguna de sus rutas hijas está
        // activa (ej. F5 en una pantalla profunda); si no, colapsado.
        if (this.esRootColapsable() && this.contieneRutaActiva(this.item()?.items ?? [])) {
            this.abierto.set(true);
        }
    }

    toggleRoot() {
        this.abierto.update((v) => !v);
    }

    private contieneRutaActiva(items: any[]): boolean {
        const url = this.router.url;
        return items.some((hijo) => {
            const ruta = Array.isArray(hijo?.routerLink) ? hijo.routerLink[0] : hijo?.routerLink;
            if (ruta && url.startsWith(String(ruta))) return true;
            return hijo?.items ? this.contieneRutaActiva(hijo.items) : false;
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initialized.set(true);
        });
    }

    updateActiveStateFromRoute() {
        const item = this.item();
        if (!item?.routerLink) return;

        const isRouteActive = this.router.isActive(item.routerLink[0], {
            paths: 'exact',
            queryParams: 'ignored',
            matrixParams: 'ignored',
            fragment: 'ignored'
        });

        if (isRouteActive) {
            const parentPath = this.parentPath();
            if (parentPath) {
                this.layoutService.layoutState.update((val) => ({
                    ...val,
                    activePath: parentPath
                }));
            }
        }
    }

    itemClick(event: Event) {
        const item = this.item();

        if (item?.disabled) {
            event.preventDefault();
            return;
        }

        if (item?.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (this.hasChildren()) {
            if (this.isActive()) {
                this.layoutService.layoutState.update((val) => ({
                    ...val,
                    activePath: this.parentPath()
                }));
            } else {
                this.layoutService.layoutState.update((val) => ({
                    ...val,
                    activePath: this.fullPath(),
                    menuHoverActive: true
                }));
            }
        } else {
            this.layoutService.layoutState.update((val) => ({
                ...val,
                overlayMenuActive: false,
                staticMenuMobileActive: false,
                mobileMenuActive: false,
                menuHoverActive: false
            }));
        }
    }
}
