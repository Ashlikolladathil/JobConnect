import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.css']
})
export class EditJobComponent implements OnInit {

  jobId = 0;

  job = {
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    required_skills: ''
  };

  message = '';
  isSaving = false;

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));

    const token = this.authService.getToken();

    if (!token) {
      this.message = 'Please log in again.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(`${this.apiUrl}/my-jobs/`, { headers }).subscribe({
      next: (jobs) => {
        const existingJob = jobs.find(job => job.id === this.jobId);

        if (existingJob) {
          this.job = {
            title: existingJob.title,
            company: existingJob.company,
            location: existingJob.location,
            salary: existingJob.salary,
            description: existingJob.description,
            required_skills: existingJob.required_skills || ''
          };
        } else {
          this.message = 'Job not found in your posted jobs.';
        }
      },
      error: () => {
        this.message = 'Unable to load the job details.';
      }
    });
  }

  updateJob(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.message = 'Please log in again.';
      return;
    }

    this.isSaving = true;
    this.message = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.put<any>(
      `${this.apiUrl}/edit-job/${this.jobId}/`,
      this.job,
      { headers }
    ).subscribe({
      next: (response) => {
        this.message = response.message || 'Job updated successfully!';
        this.isSaving = false;

        setTimeout(() => {
          this.router.navigate(['/manage-jobs']);
        }, 1000);
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Unable to update the job.';
        this.isSaving = false;
      }
    });
  }
}