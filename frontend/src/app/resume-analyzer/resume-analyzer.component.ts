import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

@Component({
  selector: 'app-resume-analyzer',
  templateUrl: './resume-analyzer.component.html',
  styleUrls: ['./resume-analyzer.component.css']
})
export class ResumeAnalyzerComponent implements OnInit {

  private apiUrl = 'http://127.0.0.1:8000/api/resume-analyzer/';

  resumeText = '';
  requiredSkills = '';
  jobs: any[] = [];
  selectedJobId: number | null = null;
  jobsLoading = false;
  selectedFile: File | null = null;

  result: any = null;
  errorMessage = '';
  isLoading = false;
  isExtracting = false;

  constructor(
     private http: HttpClient,
     private router: Router
     ) {}

  ngOnInit(): void {
  this.loadAvailableJobs();
}

  loadAvailableJobs(): void {

  this.jobsLoading = true;

  this.http.get<any[]>(
    'http://127.0.0.1:8000/api/jobs/'
  ).subscribe({

    next: (data) => {
      this.jobs = data;
      this.jobsLoading = false;
    },

    error: (error) => {
      console.error('Error loading jobs:', error);
      this.jobsLoading = false;
    }

  });
 }

 onJobSelected(jobId: number | null): void {

  this.result = null;

  const selectedJob = this.jobs.find(
    job => Number(job.id) === Number(jobId)
  );

  if (selectedJob) {
    this.requiredSkills = selectedJob.required_skills || '';
  } else {
    this.requiredSkills = '';
  }
}

  onFileSelected(event: Event): void {

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  this.selectedFile = null;
  this.errorMessage = '';
  this.result = null;
  this.resumeText = '';

  if (!file) {
    return;
  }

  const allowedExtensions = ['pdf', 'docx'];
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !allowedExtensions.includes(extension)) {
    this.errorMessage = 'Please select a PDF or DOCX file.';
    input.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    this.errorMessage = 'File size must not exceed 5 MB.';
    input.value = '';
    return;
  }

  this.selectedFile = file;
  this.isExtracting = true;

  const formData = new FormData();

  formData.append('resume', file);
  formData.append('extract_only', 'true');

  this.http.post<any>(this.apiUrl, formData).subscribe({

    next: (response) => {

      this.resumeText = response.resume_text || '';

      this.isExtracting = false;

      if (!this.resumeText.trim()) {
        this.errorMessage = 'No readable text found in this resume.';
      }

    },

    error: (error) => {

      console.error('Resume extraction error:', error);

      this.errorMessage =
        error.error?.message ||
        'Unable to extract text from your resume.';

      this.isExtracting = false;
      this.selectedFile = null;
      input.value = '';

    }

  });
}

  analyzeResume(): void {
    if (!this.selectedFile && !this.resumeText.trim()) {
      this.errorMessage = 'Please upload a resume or enter resume text.';
      return;
    }

    if (!this.requiredSkills.trim()) {
      this.errorMessage = 'Please enter the required job skills.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;

    let requestBody: FormData | {
      resume_text: string;
      required_skills: string;
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('resume', this.selectedFile);
      formData.append('required_skills', this.requiredSkills);
      requestBody = formData;
    } else {
      requestBody = {
        resume_text: this.resumeText,
        required_skills: this.requiredSkills
      };
    }

    this.http.post<any>(this.apiUrl, requestBody).subscribe({
      next: (data) => {
        this.result = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Resume analysis error:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to analyze your resume. Please try again.';

        this.isLoading = false;
      }
    });
  }

  goBackToDashboard(): void {
  this.router.navigate(['/jobseeker-dashboard']);
 }
}