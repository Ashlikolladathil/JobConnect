import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api/login/';

  constructor(private http: HttpClient) {}

  register(
  username: string,
  email: string,
  password: string,
  role: string,
  skills: string,
  experience: string
): Observable<any> {
  return this.http.post<any>(
    'http://127.0.0.1:8000/api/register/',
    {
      username: username,
      email: email,
      password: password,
      role: role,
      skills: skills,
      experience: experience
    }
  );
}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      email: email,
      password: password
    }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('username', response.username);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
  }


  getUserRole(): string | null {
      return localStorage.getItem('user_role');
  }

  isLoggedIn(): boolean {
      return !!this.getToken();
 }


}