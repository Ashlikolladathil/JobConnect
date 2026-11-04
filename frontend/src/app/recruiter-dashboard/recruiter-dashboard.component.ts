import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ManageJobsService } from '../manage-jobs.service';

@Component({
  selector: 'app-recruiter-dashboard',
  templateUrl: './recruiter-dashboard.component.html',
  styleUrls: ['./recruiter-dashboard.component.css']
})
export class RecruiterDashboardComponent implements OnInit {

  totalJobs = 0;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private manageJobsService: ManageJobsService
  ) {}

  ngOnInit(): void {
    this.manageJobsService.getMyJobs().subscribe({
      next: (jobs) => {
        this.totalJobs = jobs.length;
      },
      error: (error) => {
        console.error('Unable to load recruiter jobs:', error);
        this.errorMessage = 'Unable to load your job count.';
      }
    });
  }

  openAddJob(): void {
    this.router.navigate(['/post-job']);
  }

  openManageJobs(): void {
    this.router.navigate(['/manage-jobs']);
  }

  openApplicants(): void {
  this.router.navigate(['/recruiter-applications']);
  }

  logout(): void {
  this.authService.logout();
  this.router.navigate(['/']);
 }
}