import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../job.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // Available jobs
  jobs: any[] = [];
  appliedJobIds: number[] = [];
  searchTerm = '';


  isLoading = false;
  errorMessage = '';

  // Navigation and login status
  isLoggedIn = false;
  userRole: string | null = null;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {}

   ngOnInit(): void {
   this.updateNavigation();
   this.loadJobs();

   if (this.isLoggedIn && this.userRole === 'jobseeker') {
    this.loadMyApplications();
  }
}

  // Check the current user's login status and role
  updateNavigation(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole();
  }

  loadMyApplications(): void {
  this.jobService.getMyApplications().subscribe({
    next: applications => {
      this.appliedJobIds = applications.map(
        application => Number(application.job_id)
      );
    },
    error: error => {
      console.error('Error loading applications:', error);
    }
  });
}

hasApplied(jobId: number): boolean {
  return this.appliedJobIds.includes(Number(jobId));
}

  // Load jobs from the Django API
  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading jobs:', error);

        this.errorMessage =
          'Unable to load jobs. Please try again later.';

        this.isLoading = false;
      }
    });
  }

  // Log out and return to the welcome page
  logout(): void {
    this.authService.logout();

    this.isLoggedIn = false;
    this.userRole = null;

    this.router.navigate(['/']);
  }

  get filteredJobs(): any[] {
  const search = this.searchTerm.trim().toLowerCase();

  // Show all jobs when the search box is empty
  if (!search) {
    return this.jobs;
  }

  // Search by job title, company, or location
  return this.jobs.filter(job =>
    (job.title || '').toLowerCase().includes(search) ||
    (job.company || '').toLowerCase().includes(search) ||
    (job.location || '').toLowerCase().includes(search)
  );
 }

}