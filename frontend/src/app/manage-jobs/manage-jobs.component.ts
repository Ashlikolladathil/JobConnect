import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ManageJobsService } from '../manage-jobs.service';

@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class ManageJobsComponent implements OnInit {

  jobs: any[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(
    private manageJobsService: ManageJobsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.manageJobsService.getMyJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Please log in again to view your jobs.';
        } else if (error.status === 403) {
          this.errorMessage = 'Only recruiters can manage posted jobs.';
        } else {
          this.errorMessage = 'Unable to load jobs. Please try again.';
        }

        console.error('Manage jobs error:', error);
      }
    });
  }

  editJob(jobId: number): void {
     this.router.navigate(['/edit-job', jobId]);
  }

  deleteJob(jobId: number): void {
  const confirmed = confirm(
    'Are you sure you want to delete this job?'
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    this.errorMessage = 'Please log in again.';
    return;
  }

  this.manageJobsService.deleteJob(jobId).subscribe({
    next: () => {
      this.jobs = this.jobs.filter(job => job.id !== jobId);
      alert('Job deleted successfully!');
    },
    error: (error) => {
      if (error.status === 401) {
        this.errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.status === 403) {
        this.errorMessage = 'You are not allowed to delete this job.';
      } else {
        this.errorMessage = error.error?.message || 'Unable to delete the job.';
      }

      console.error('Delete job error:', error);
    }
  });
}

  goToDashboard(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }
}