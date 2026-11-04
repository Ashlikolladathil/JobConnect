import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecruiterApplicationsService {

  private apiUrl =
    'http://127.0.0.1:8000/api/recruiter-applications/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getApplications(): Observable<any[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  updateApplicationStatus(
  applicationId: number,
  status: string,
  rejectionReason: string = ''
): Observable<any> {
  const token = this.authService.getToken();

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.patch(
    `${this.apiUrl}${applicationId}/`,
    {
      status: status,
      rejection_reason: rejectionReason
    },
    { headers }
  );
  }
}
