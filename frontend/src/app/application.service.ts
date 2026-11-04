import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private apiUrl = 'http://127.0.0.1:8000/api/my-applications/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMyApplications(): Observable<any[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}