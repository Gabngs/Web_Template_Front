export interface IApiSuccess<T> {
  status: string;
  message: string;
  data: T;
}

export interface IApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

export interface IApiResponse<T = any> {
  message: string;
  data: T;
}

export interface IApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  avatar?: string | null;
}

export interface IPaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
