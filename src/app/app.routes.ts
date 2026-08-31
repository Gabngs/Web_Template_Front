import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// El template no tiene sitio público: el shell admin se monta directo en la
// raíz (a diferencia de gsp-front, que lo cuelga bajo /dashboard). Los menús
// de siaw_menus guardan rutas como '/configuracion-sistema/...'.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  // Alias: un menú viejo o de seeder con ruta '/dashboard' cae en el inicio.
  { path: 'dashboard', pathMatch: 'full', redirectTo: '' },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard-admin/dashboard-admin.routes').then(m => m.DASHBOARD_ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
