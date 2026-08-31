import { Injectable } from '@angular/core';

const THEME_KEY = 'ui_theme_dark';

@Injectable({ providedIn: 'root' })
export class ThemeStorageService {
  get(): boolean | null {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === null ? null : raw === 'true';
  }

  set(isDark: boolean): void {
    localStorage.setItem(THEME_KEY, String(isDark));
  }
}
