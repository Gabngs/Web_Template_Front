import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@services/api/auth.service';
import { AppLayout } from '@shared/layout/shell/app-layout';

// Punto de montaje de la ruta /dashboard (ver dashboard-admin.routes.ts).
// Solo hace el bootstrap de sesión; el chrome (topbar/sidebar/footer/toast)
// lo pone AppLayout — el layout adaptado de Sakai.
@Component({
  selector: 'app-admin-shell',
  imports: [AppLayout],
  template: `<app-layout />`,
})
export class AdminShell implements OnInit {
  private readonly auth = inject(AuthService);

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.cargarSesion();
    } catch {
      /* la sesión inválida ya la maneja el interceptor / guard */
    }
  }
}
