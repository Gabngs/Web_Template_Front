import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AUTH_URL } from '@core/constants/api-url';
import { IAuthLogin, IAuthLoginResponse, IAuthMeResponse } from '@interfaces/auth.interface';
import { IUser } from '@interfaces/shared.interface';
import { environment } from '@env/environment';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(credentials: IAuthLogin): Observable<IAuthLoginResponse> {
    return this.http
      .post<IAuthLoginResponse>(`${AUTH_URL}/${environment.ep.auth.login}`, credentials)
      .pipe(
        tap(res => {
          if (res.data?.token) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
          }
          if (res.data?.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
          }
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${AUTH_URL}/${environment.ep.auth.logout}`, {})
      .pipe(tap(() => this.clearSession()));
  }

  me(): Observable<IAuthMeResponse> {
    return this.http.get<IAuthMeResponse>(`${AUTH_URL}/${environment.ep.auth.me}`);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): IUser | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? (JSON.parse(user) as IUser) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
