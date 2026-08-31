import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AnillosLoader } from '../anillos-loader/anillos-loader';

// Fallback para cualquier ruta que no matchea dentro del AdminShell — ej.
// un menú creado en Mantenimiento de Menús cuya página todavía no existe.
// Se registra como wildcard ('**') en cada *.routes.ts generado por
// scripts/generate-routes.mjs, así que siempre renderiza DENTRO del shell
// (topbar/sidebar/footer intactos), nunca como página en blanco.
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonModule, AnillosLoader],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  volverAtras(): void {
    // Si no hay historial (entraron directo por URL), al dashboard.
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
