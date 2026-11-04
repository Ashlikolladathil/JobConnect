import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminApplicationsService {

  private apiUrl = 'http://127.0.0.1:8000/api/admin-applications/';

  constructor(private http: HttpClient) {}

  getApplications(): Observable<any[]> {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  getApplicationStatusStats(): Observable<any> {
  const token = localStorage.getItem('access_token');

  return this.http.get<any>(
    'http://127.0.0.1:8000/api/admin-application-status-stats/',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
 }
}