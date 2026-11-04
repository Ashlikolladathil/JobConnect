import { Component, OnInit } from '@angular/core';

import { JobService } from '../job.service';

import { Router } from '@angular/router';

import { ApplicationService } from '../application.service';

@Component({
  selector: 'app-jobseeker-dashboard',
  templateUrl: './jobseeker-dashboard.component.html',
  styleUrls: ['./jobseeker-dashboard.component.css']
})
export class JobseekerDashboardComponent implements OnInit {

  jobs: any[] = [];
  errorMessage = '';

  applications: any[] = [];
  applicationError = '';

  totalApplications = 0;
  pendingApplications = 0;
  shortlistedApplications = 0;
  acceptedApplications = 0;
  rejectedApplications = 0;

  constructor(
     private jobService: JobService,
     private applicationService: ApplicationService,
     private router: Router
     ) {}


  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data;

       // Get AI match details for each job
          this.jobs.forEach((job: any) => {
          this.jobService.getJobMatch(job.id).subscribe({
          next: (matchData) => {
          job.match_percentage = matchData.match_percentage;
          job.matched_skills = matchData.matched_skills;
          job.missing_skills = matchData.missing_skills;
          },
          error: (error) => {
           console.error(
            'Error loading job match for job ID:',
            job.id,
            error
           );
          }
        });
       });
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.errorMessage = 'Unable to load jobs. Please try again.';
      }
    });

    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationService.getMyApplications().subscribe({
    next: data => {
    this.applications = data;

    this.totalApplications = data.length;

    this.pendingApplications = data.filter(
    (app: any) => app.status === 'pending'
    ).length;

    this.shortlistedApplications = data.filter(
    (app: any) => app.status === 'shortlisted'
    ).length;

    this.acceptedApplications = data.filter(
    (app: any) => app.status === 'accepted'
    ).length;

    this.rejectedApplications = data.filter(
    (app: any) => app.status === 'rejected'
    ).length;

    this.applicationError = '';
},
    error: error => {
      console.error('Error loading applications:', error);
      this.applicationError = 'Unable to load your applications.';
    }
  });
 }

  viewJob(jobId: number): void {
  this.router.navigate(['/job-details', jobId]);
  }

  openResumeAnalyzer(): void {
  this.router.navigate(['/resume-analyzer']);
 }

   logout(): void {
    this.router.navigate(['/']);
   }
}