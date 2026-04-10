import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  isDark = signal<boolean>(false);

  toggleTheme(): void {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('dark-mode', this.isDark());
  }
}
