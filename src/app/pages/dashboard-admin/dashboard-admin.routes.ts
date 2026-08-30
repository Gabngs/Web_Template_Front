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
        path: 'parametros-sistema',
        loadChildren: () =>
          import('./parametros-sistema/parametros-sistema.routes').then(
            (m) => m.PARAMETROS_SISTEMA_ROUTES,
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
