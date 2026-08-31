import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { AuthService } from '@services/api/auth.service';
import { PermisoService } from '@services/api/permiso.service';
import { ISesionMenu } from '@interfaces/models/sesion-menu.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Card],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  readonly auth = inject(AuthService);
  private readonly permiso = inject(PermisoService);

  readonly appName = environment.appName;

  readonly accesos = computed<ISesionMenu[]>(() =>
    this.permiso.menusPropios().filter(m => m.dashboard && m.ruta)
  );
}
