// AUTO-GENERADO por scripts/generate-routes.mjs — no editar a mano.
import { Routes } from '@angular/router';

export const DASHBOARD_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', loadComponent: () => import('./inicio/inicio').then((m) => m.Inicio) },
      {
        path: 'configuracion-sistema',
        loadChildren: () =>
          import('./configuracion-sistema/configuracion-sistema.routes').then(
            (m) => m.CONFIGURACION_SISTEMA_ROUTES,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('@shared/components/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
