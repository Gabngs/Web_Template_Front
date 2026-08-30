/**
 * Uso:
 * import { esDniValido, esCorreoValido } from '@shared/helpers/helper-validaciones';
 *
 * if (!esDniValido(this.form.dni) || !esCorreoValido(this.form.email)) return;
 */
export const LONGITUDES_VALIDACION = {
  maximoTelefono: 9,
  maximoRuc: 11,
  maximoDni: 8,
} as const;

export function esRequerido(valor: unknown): boolean {
  return valor !== null && valor !== undefined && String(valor).trim().length > 0;
}

export function camposRequeridos(campos: Record<string, unknown>): boolean {
  return Object.values(campos).every(esRequerido);
}

export function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function soloLetras(valor: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(valor.trim());
}

export function soloNumeros(valor: string | number): boolean {
  return /^\d+$/.test(String(valor).trim());
}

export function soloLetrasYNumeros(valor: string): boolean {
  return /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(valor.trim());
}

export function tieneLongitudMinima(valor: string, minimo: number): boolean {
  return valor.trim().length >= minimo;
}

export function tieneLongitudMaxima(valor: string, maximo: number): boolean {
  return valor.trim().length <= maximo;
}

export function tieneLongitudExacta(valor: string | number, longitud: number): boolean {
  return String(valor).trim().length === longitud;
}

export function esTelefonoValido(telefono: string | number): boolean {
  return (
    soloNumeros(telefono) && tieneLongitudExacta(telefono, LONGITUDES_VALIDACION.maximoTelefono)
  );
}

export function esRucValido(ruc: string | number): boolean {
  return soloNumeros(ruc) && tieneLongitudExacta(ruc, LONGITUDES_VALIDACION.maximoRuc);
}

export function esDniValido(dni: string | number): boolean {
  return soloNumeros(dni) && tieneLongitudExacta(dni, LONGITUDES_VALIDACION.maximoDni);
}

export function coinciden(valor: string, confirmacion: string): boolean {
  return valor === confirmacion;
}

export function sonDiferentes(valor: string, comparacion: string): boolean {
  return valor !== comparacion;
}
