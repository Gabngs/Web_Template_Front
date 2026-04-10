import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ScrollTopModule } from 'primeng/scrolltop';
import { PrimeNG } from 'primeng/config';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ScrollTopModule],
  template: `
    <p-toast />
    <router-outlet />
    <p-scroll-top />
  `,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly config = inject(PrimeNG);
  private readonly router = inject(Router);

  showNavbar = true;
  showFooter = true;

  private readonly hiddenLayoutRoutes = ['/login', '/register', '/forgot-password'];

  ngOnInit(): void {
    this.configurarIdiomaEspanol();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const hideLayout = this.hiddenLayoutRoutes.some(route => url.startsWith(route));
        this.showNavbar = !hideLayout;
        this.showFooter = !hideLayout;
      });
  }

  private configurarIdiomaEspanol(): void {
    import('primelocale/es.json').then((locale: any) => {
      this.config.setTranslation(locale.default?.es ?? locale.es ?? locale);
    });
  }
}
