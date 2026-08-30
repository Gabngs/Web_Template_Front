import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from './layout.service';

// Configurador recortado respecto al de Sakai: SIN selector de "Presets"
// (el preset es SIEMPRE Aura, alineado con AppPreset en app.config.ts).
// Quedan: color principal, color de fondo y modo de menú.

declare type SurfacesType = {
  name?: string;
  palette?: Record<string, string>;
};

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectButtonModule],
  template: `
    <div class="cfg">
      <section>
        <span class="cfg__label">Color principal</span>
        <div class="cfg__swatches">
          @for (color of primaryColors(); track color.name) {
            <button
              type="button"
              class="cfg-swatch"
              [class.cfg-swatch--on]="color.name === selectedPrimaryColor()"
              [title]="color.name"
              [style.background]="color.name === 'noir' ? 'var(--text-color)' : color.palette?.['500']"
              (click)="updateColors($event, 'primary', color)"
            ></button>
          }
        </div>
      </section>

      <section>
        <span class="cfg__label">Fondo</span>
        <div class="cfg__swatches">
          @for (surface of surfaces; track surface.name) {
            <button
              type="button"
              class="cfg-swatch"
              [class.cfg-swatch--on]="isSurfaceOn(surface.name)"
              [title]="surface.name"
              [style.background]="surface.palette?.['500']"
              (click)="updateColors($event, 'surface', surface)"
            ></button>
          }
        </div>
      </section>

      <section>
        <span class="cfg__label">Modo de menú</span>
        <p-selectbutton
          [ngModel]="menuMode()"
          (ngModelChange)="onMenuModeChange($event)"
          [options]="menuModeOptions"
          optionLabel="label"
          optionValue="value"
          [allowEmpty]="false"
          size="small"
        />
      </section>
    </div>
  `,
  host: {
    class:
      'hidden absolute top-13 right-0 w-64 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.06),0px_0px_2px_rgba(0,0,0,0.08),0px_1px_4px_rgba(0,0,0,0.10)]',
  },
  styles: [
    `
      .cfg {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .cfg__label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-color-secondary);
      }
      .cfg__swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .cfg-swatch {
        width: 1.5rem;
        height: 1.5rem;
        flex: 0 0 auto;
        border: 0;
        padding: 0;
        border-radius: 999px;
        cursor: pointer;
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.08) inset;
        transition: outline-color 0.15s, transform 0.1s;
      }
      .cfg-swatch:hover {
        transform: scale(1.12);
      }
      .cfg-swatch--on {
        outline-color: var(--primary-color);
      }
    `,
  ],
})
export class AppConfigurator implements OnInit {
  layoutService = inject(LayoutService);
  platformId = inject(PLATFORM_ID);

  menuModeOptions = [
    { label: 'Fijo', value: 'static' },
    { label: 'Superpuesto', value: 'overlay' },
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Re-aplica el color principal guardado sobre Aura al montar.
      this.applyTheme('primary', this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) ?? {});
    }
  }

  surfaces: SurfacesType[] = [
    { name: 'slate', palette: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' } },
    { name: 'gray', palette: { 0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' } },
    { name: 'zinc', palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' } },
    { name: 'neutral', palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' } },
    { name: 'stone', palette: { 0: '#ffffff', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' } },
    { name: 'soho', palette: { 0: '#ffffff', 50: '#ececec', 100: '#dedfdf', 200: '#c4c4c6', 300: '#adaeb0', 400: '#97979b', 500: '#7f8084', 600: '#6a6b70', 700: '#55565b', 800: '#3f4046', 900: '#2c2c34', 950: '#16161d' } },
    { name: 'viva', palette: { 0: '#ffffff', 50: '#f3f3f3', 100: '#e7e7e8', 200: '#cfd0d0', 300: '#b7b8b9', 400: '#9fa1a1', 500: '#87898a', 600: '#6e7173', 700: '#565a5b', 800: '#3e4244', 900: '#262b2c', 950: '#0e1315' } },
    { name: 'ocean', palette: { 0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2', 300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274', 700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920' } },
  ];

  selectedPrimaryColor = computed(() => this.layoutService.layoutConfig().primary);
  selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);
  menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

  primaryColors = computed<SurfacesType[]>(() => {
    const presetPalette = (Aura as unknown as { primitive: Record<string, Record<string, string>> }).primitive;
    const colors = ['emerald', 'green', 'lime', 'orange', 'amber', 'yellow', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const palettes: SurfacesType[] = [{ name: 'noir', palette: {} }];
    colors.forEach((color) => palettes.push({ name: color, palette: presetPalette?.[color] }));
    return palettes;
  });

  isSurfaceOn(name?: string): boolean {
    const sel = this.selectedSurfaceColor();
    if (sel) return sel === name;
    return this.layoutService.isDarkTheme() ? name === 'zinc' : name === 'slate';
  }

  getPresetExt() {
    const color: SurfacesType = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || {};

    if (color.name === 'noir') {
      return {
        semantic: {
          primary: {
            50: '{surface.50}', 100: '{surface.100}', 200: '{surface.200}', 300: '{surface.300}', 400: '{surface.400}',
            500: '{surface.500}', 600: '{surface.600}', 700: '{surface.700}', 800: '{surface.800}', 900: '{surface.900}', 950: '{surface.950}',
          },
          colorScheme: {
            light: {
              primary: { color: '{primary.950}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.700}' },
              highlight: { background: '{primary.950}', focusBackground: '{primary.700}', color: '#ffffff', focusColor: '#ffffff' },
            },
            dark: {
              primary: { color: '{primary.50}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.300}' },
              highlight: { background: '{primary.50}', focusBackground: '{primary.300}', color: '{primary.950}', focusColor: '{primary.950}' },
            },
          },
        },
      };
    }

    return {
      semantic: {
        primary: color.palette,
        colorScheme: {
          light: {
            primary: { color: '{primary.500}', contrastColor: '#ffffff', hoverColor: '{primary.600}', activeColor: '{primary.700}' },
            highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' },
          },
          dark: {
            primary: { color: '{primary.400}', contrastColor: '{surface.900}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
            highlight: {
              background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
              focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
              color: 'rgba(255,255,255,.87)',
              focusColor: 'rgba(255,255,255,.87)',
            },
          },
        },
      },
    };
  }

  updateColors(event: Event, type: 'primary' | 'surface', color: SurfacesType) {
    if (type === 'primary') {
      this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name ?? state.primary }));
    } else {
      this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name ?? null }));
    }
    this.applyTheme(type, color);
    event.stopPropagation();
  }

  applyTheme(type: 'primary' | 'surface', color: SurfacesType) {
    if (type === 'primary') {
      updatePreset(this.getPresetExt());
    } else if (color.palette) {
      updateSurfacePalette(color.palette);
    }
  }

  onMenuModeChange(mode: string) {
    this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: mode }));
  }
}
