import { environment } from '@env/environment';

export const API_URL = environment.apiUrl;
export const AUTH_URL = `${API_URL}/auth`;
// Por cada endpoint:
// export const URL_EXAMPLE = `${API_URL}/${environment.ep.example}`;
export const SITE_URL = environment.apiUrl.replace('/api', '');
