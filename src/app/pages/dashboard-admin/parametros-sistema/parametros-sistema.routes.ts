// AUTO-GENERADO por scripts/generate-routes.mjs — no editar a mano.
// Ruta por defecto ('' del dominio): carpeta "inicio", o route.config.json con
// { "default": "carpeta-hermana" } (redirect relativo) o { "redirectTo": "/ruta" }.
import { Routes } from '@angular/router';

export const PARAMETROS_SISTEMA_ROUTES: Routes = [
  { path: '', redirectTo: 'control-usuarios', pathMatch: 'full' },
  {
    path: 'control-usuarios',
    loadComponent: () =>
      import('./control-usuarios/control-usuarios').then((m) => m.ControlUsuarios),
  },
  {
    path: 'mantenimiento-menus',
    loadComponent: () =>
      import('./mantenimiento-menus/mantenimiento-menus').then((m) => m.MantenimientoMenus),
  },
  {
    path: 'mantenimiento-roles',
    loadComponent: () =>
      import('./mantenimiento-roles/mantenimiento-roles').then((m) => m.MantenimientoRoles),
  },
  {
    path: 'mantenimiento-sistemas',
    loadComponent: () =>
      import('./mantenimiento-sistemas/mantenimiento-sistemas').then(
        (m) => m.MantenimientoSistemas,
      ),
  },
  {
    path: 'modelos-permisos',
    loadComponent: () =>
      import('./modelos-permisos/modelos-permisos').then((m) => m.ModelosPermisos),
  },
  {
    path: '**',
    loadComponent: () => import('@shared/components/not-found/not-found').then((m) => m.NotFound),
  },
];
