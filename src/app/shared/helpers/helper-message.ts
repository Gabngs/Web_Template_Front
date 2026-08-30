import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface NotifyOptions {
  summary?: string;
  life?: number;
}

const DEFAULT_SUMMARIES: Record<ToastSeverity, string> = {
  success: 'Éxito',
  info: 'Información',
  warn: 'Atención',
  error: 'Error',
};

const DEFAULT_LIFE: Record<ToastSeverity, number> = {
  success: 3000,
  info: 3000,
  warn: 4000,
  error: 5000,
};

@Injectable({ providedIn: 'root' })
export class HelperMessage {
  constructor(private readonly messageService: MessageService) {}

  success(detail: string, options?: NotifyOptions): void {
    this.show('success', detail, options);
  }

  info(detail: string, options?: NotifyOptions): void {
    this.show('info', detail, options);
  }

  warn(detail: string, options?: NotifyOptions): void {
    this.show('warn', detail, options);
  }

  error(detail: string, options?: NotifyOptions): void {
    this.show('error', detail, options);
  }

  /**
   * Resuelve la severidad a partir de un status HTTP (código ApiResponse del backend).
   * `overrides` permite ajustar el mapeo para un caso puntual sin tocar el default global.
   */
  resolveSeverity(status?: number, overrides?: Partial<Record<number, ToastSeverity>>): ToastSeverity {
    if (status != null) {
      const override = overrides?.[status];
      if (override) return override;
    }

    // Sin conexión / timeout (status 0) o status ausente: falla real, no corregible por el usuario.
    if (status == null || status === 0) return 'error';

    // 4xx = el usuario puede corregir algo (input, registro no existe, ruta) -> warn
    if (status >= 400 && status < 500) return 'warn';

    // 5xx = falla real del servidor -> error
    return 'error';
  }

  /**
   * Extrae el mensaje legible de una respuesta de error siguiendo el
   * Template Estándar Backend (ApiResponse / FormRequest 422).
   *
   * Acepta `unknown` (el tipo real de un error capturado) para que los
   * componentes no tengan que importar ni castear `HttpErrorResponse`.
   */
  extractErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
    const body = (error as HttpErrorResponse | null)?.error;

    // 422 de un FormRequest (Laravel) — { message, errors: { campo: string[] } }
    // OJO: responseBadRequest/responseNotFound mandan `errors` como STRING literal ("Error"),
    // no como mapa de campos — hay que exigir objeto (no array) para no trocear el string en chars.
    if (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
      return Object.values(body.errors as Record<string, string[]>).flat().join(' ');
    }

    // ApiResponse::responseUnAuthenticated/responseNotFound/etc — { errors: [{ status, title, detail }] }
    if (Array.isArray(body?.errors) && body.errors[0]?.detail) {
      return body.errors[0].detail;
    }

    // Middlewares custom { status: "error", message } y ApiResponse::responseSuccess/Created { status, message, data }
    return body?.message ?? fallback;
  }

  /**
   * Extrae el mensaje y resuelve la severidad automáticamente según el status HTTP,
   * y muestra el toast en un solo llamado. Reemplaza el patrón repetido
   * `err.status === 422 ? messageWarn(...) : messageError(...)` que hoy vive
   * duplicado (e inconsistente) en cada componente.
   */
  notifyHttpError(
    error: unknown,
    fallback?: string,
    options?: NotifyOptions & { severityOverrides?: Partial<Record<number, ToastSeverity>> },
  ): void {
    const detail = this.extractErrorMessage(error, fallback);
    const status = (error as HttpErrorResponse | null)?.status;
    const severity = this.resolveSeverity(status, options?.severityOverrides);
    this.show(severity, detail, options);
  }

  private show(severity: ToastSeverity, detail: string, options?: NotifyOptions): void {
    this.messageService.add({
      severity,
      summary: options?.summary ?? DEFAULT_SUMMARIES[severity],
      detail,
      life: options?.life ?? DEFAULT_LIFE[severity],
    });
  }
}
