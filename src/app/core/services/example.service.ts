import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api-url';
import {
  IExampleList,
  IExampleSingle,
  IExampleCreate,
  IExampleUpdate,
} from '@interfaces/example.interface';
import { environment } from '@env/environment';

const URL_EXAMPLE = `${API_URL}/${environment.ep.example}`;

@Injectable({ providedIn: 'root' })
export class ExampleService {
  constructor(private readonly http: HttpClient) {}

  index(filters?: Record<string, any>): Observable<IExampleList> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const v = filters[key];
        if (v !== null && v !== undefined && v !== '') {
          params = params.set(key, v.toString());
        }
      });
    }
    return this.http.get<IExampleList>(URL_EXAMPLE, { params });
  }

  show(id: string): Observable<IExampleSingle> {
    return this.http.get<IExampleSingle>(`${URL_EXAMPLE}/${id}`);
  }

  create(data: IExampleCreate): Observable<IExampleSingle> {
    return this.http.post<IExampleSingle>(URL_EXAMPLE, data);
  }

  update(id: string, data: IExampleUpdate): Observable<IExampleSingle> {
    return this.http.put<IExampleSingle>(`${URL_EXAMPLE}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${URL_EXAMPLE}/${id}`);
  }

  exportToExcel(filters?: Record<string, any>): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const v = filters[key];
        if (v !== null && v !== undefined && v !== '') {
          params = params.set(key, v.toString());
        }
      });
    }
    return this.http.get(`${URL_EXAMPLE}/export/`, { params, responseType: 'blob' });
  }
}
