import { Component, inject, viewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { Menu } from 'primeng/menu';
import { AppConfigurator } from './app-configurator';
import { LayoutService } from './layout.service';
import { AuthService } from '@services/api/auth.service';
import { ThemeService } from '@services/ui/theme.service';
import { MenuSearch } from '@shared/components/menu-search/menu-search';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, Menu, AppConfigurator, MenuSearch],
    template: ` <div class="layout-topbar">
            <!-- Izquierda: logo · botón de menú · buscador -->
            <div class="layout-topbar-logo-container">
                <a class="layout-topbar-logo" routerLink="/dashboard">
                    <i class="pi pi-sparkles" style="font-size: 1.35rem"></i>
                    <span>{{ appName }}</span>
                </a>
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()" title="Mostrar / ocultar menú">
                    <i class="pi pi-bars"></i>
                </button>
                <button type="button" class="layout-topbar-action" (click)="menuSearch().alternar()" title="Buscar un menú (Ctrl+K)">
                    <i class="pi pi-search"></i>
                </button>
            </div>

            <!-- Derecha: tema · personalizar · cuenta -->
            <div class="layout-topbar-actions">
                <button type="button" class="layout-topbar-action" (click)="theme.toggle()" [title]="theme.isDark() ? 'Modo claro' : 'Modo oscuro'">
                    <i class="pi" [ngClass]="theme.isDark() ? 'pi-sun' : 'pi-moon'"></i>
                </button>

                <div class="relative">
                    <button
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                        title="Personalizar tema"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>

                <button type="button" class="layout-topbar-action layout-topbar-user" (click)="userMenu.toggle($event)" title="Cuenta">
                    <i class="pi pi-user"></i>
                    <span class="hidden sm:inline">{{ auth.usuario()?.nombre ?? 'Cuenta' }}</span>
                    <i class="pi pi-angle-down hidden sm:inline" style="font-size: 0.75rem"></i>
                </button>
                <p-menu #userMenu [popup]="true" [model]="userMenuItems" appendTo="body" />
            </div>
        </div>

        <app-menu-search />`,
    styles: [
        `
            .layout-topbar-logo-container {
                width: auto;
                gap: 0.5rem;
            }
            .layout-topbar-user {
                width: auto;
                gap: 0.5rem;
                padding: 0 0.75rem;
                border-radius: var(--content-border-radius);
            }
        `,
    ],
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    theme = inject(ThemeService);
    auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly appName = environment.appName;
    readonly menuSearch = viewChild.required(MenuSearch);

    readonly userMenuItems: MenuItem[] = [
        { label: 'Inicio', icon: 'pi pi-home', routerLink: '/dashboard' },
        { separator: true },
        { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
    ];

    async logout(): Promise<void> {
        await this.auth.logout();
        this.router.navigate(['/login']);
    }
}
