import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private apiUrl = 'http://127.0.0.1:8000/api/jobs/';

  constructor(private http: HttpClient) {}

  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyApplications(): Observable<any[]> {
  const token = localStorage.getItem('access_token');

  return this.http.get<any[]>(
    'http://127.0.0.1:8000/api/my-applications/',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

  getJobMatch(jobId: number): Observable<any> {
  const token = localStorage.getItem('access_token');

  return this.http.get<any>(
    `${this.apiUrl}${jobId}/match/`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
}