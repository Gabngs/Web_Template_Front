import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CambiarPasswordDialog } from './shared/components/cambiar-password-dialog/cambiar-password-dialog';
import { GlobalLoading } from './shared/components/global-loading/global-loading';
import { ThemeService } from './services/ui/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CambiarPasswordDialog, GlobalLoading],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Se inyecta para que ThemeService corra su constructor al bootstrap
  // (aplica .app-dark según lo guardado) — ver index.html y theme-storage.service.
  readonly theme = inject(ThemeService);
}
