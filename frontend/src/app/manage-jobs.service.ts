import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ManageJobsService {

  private apiUrl = 'http://127.0.0.1:8000/api/my-jobs/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMyJobs(): Observable<any[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }

    deleteJob(jobId: number): Observable<any> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete<any>(
      `http://127.0.0.1:8000/api/delete-job/${jobId}/`,
      { headers }
    );
  }
}

 
