import { Component, OnInit } from '@angular/core';
import { RecruiterApplicationsService } from '../recruiter-applications.service';

@Component({
  selector: 'app-recruiter-applications',
  templateUrl: './recruiter-applications.component.html',
  styleUrls: ['./recruiter-applications.component.css']
})
export class RecruiterApplicationsComponent implements OnInit {

  jobs: any[] = [];
  isLoading = true;
  errorMessage = '';
  expandedJobIds: number[] = [];

  constructor(
    private applicationsService: RecruiterApplicationsService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationsService.getApplications().subscribe({
      next: (data) => {
        this.jobs = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

      if (error.status === 401) {
        this.errorMessage = 'Please log in again to view applications.';
      } else if (error.status === 403) {
        this.errorMessage = 'Only recruiters can view applications.';
      } else {
        this.errorMessage = 'Unable to load applications. Please try again.';
      }

      console.error('Recruiter applications error:', error);
    }
  });
}

toggleJobApplicants(jobId: number): void {

  if (this.expandedJobIds.includes(jobId)) {
    this.expandedJobIds =
      this.expandedJobIds.filter(id => id !== jobId);
  } else {
    this.expandedJobIds = [
      ...this.expandedJobIds,
      jobId
    ];
  }

}

isJobExpanded(jobId: number): boolean {
  return this.expandedJobIds.includes(jobId);
}

  updateStatus(
  application: any,
  status: string,
  rejectionReason: string = ''
): void {
  this.applicationsService.updateApplicationStatus(
    application.id,
    status,
    rejectionReason
  ).subscribe({
    next: (response) => {
      application.status = response.status;
      application.rejection_reason = response.rejection_reason;
      alert('Application status updated successfully!');
    },
    error: (error) => {
      console.error('Status update error:', error);
      alert(
        error.error?.message ||
        'Unable to update application status.'
      );
    }
  });
  }
}