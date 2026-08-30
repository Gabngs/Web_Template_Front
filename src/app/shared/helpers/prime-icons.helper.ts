import { PrimeIcons } from 'primeng/api';

export interface IPrimeIconOption {
  name:  string;  // nombre "bare" (sin el prefijo "pi pi-") — lo que guarda nombre_icon en BD
  label: string;
}

// PrimeIcons expone cada ícono como 'pi pi-{nombre}' (paquete primeicons ya
// instalado) — acá se pela el prefijo para quedarnos con el nombre bare que
// usa nombre_icon, y se arma la lista una sola vez al cargar el módulo.
export const PRIME_ICON_OPTIONS: IPrimeIconOption[] = Object.values(PrimeIcons)
  .filter((valor): valor is string => typeof valor === 'string')
  .map(valor => valor.replace(/^pi pi-/, ''))
  .sort()
  .map(name => ({ name, label: name }));
