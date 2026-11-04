import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css']
})
export class PostJobComponent {

  job = {
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    required_skills: ''
  };

  message = '';
  isSubmitting = false;

  private apiUrl = 'http://127.0.0.1:8000/api/add-job/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  submitJob(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.message = 'Please log in before posting a job.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(this.apiUrl, this.job, { headers }).subscribe({
      next: response => {
        this.message = response.message || 'Job posted successfully!';
        this.isSubmitting = false;

        this.job = {
          title: '',
          company: '',
          location: '',
          salary: '',
          description: '',
          required_skills: ''
        };
      },
      error: error => {
        this.message =
          error.error?.message ||
          'Unable to post the job. Please try again.';

        this.isSubmitting = false;
        console.error('Post job error:', error);
      }
    });
  }
}