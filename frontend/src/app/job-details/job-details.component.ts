import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../job.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {

  job: any = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.job = jobs.find((item: any) => item.id === jobId) || null;

        if (!this.job) {
          this.errorMessage = 'Job not found.';
        }
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.errorMessage = 'Unable to load job details.';
      }
    });
  }
}