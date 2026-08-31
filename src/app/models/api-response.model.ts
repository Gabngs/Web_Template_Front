export interface ApiResponse<T> {
  status:  number; // HTTP status code (200, 201, ...)
  message: string;
  data:    T;
}

// Respuesta de error de validación (422) — no trae `data`, trae `errors` por campo.
export interface ApiValidationErrorResponse {
  status:  number;
  message: string;
  errors:  Record<string, string[]>;
}

export interface ApiPaginatedData<T> {
  current_page:   number;
  data:            T[];
  first_page_url:  string | null;
  from:            number | null;
  last_page:       number;
  last_page_url:   string | null;
  links:           { url: string | null; label: string; active: boolean }[];
  next_page_url:   string | null;
  path:            string;
  per_page:        number;
  prev_page_url:   string | null;
  to:              number | null;
  total:           number;
}

export type ApiPaginatedResponse<T> = ApiResponse<ApiPaginatedData<T>>;
