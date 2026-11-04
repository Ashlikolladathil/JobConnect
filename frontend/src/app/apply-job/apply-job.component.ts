import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css']
})
export class ApplyJobComponent implements OnInit {

  jobId = 0;

  fullName = '';
  email = '';
  phone = '';
  skills = '';
  experience = '';
  coverLetter = '';

  resumeFile: File | null = null;

  savedResumeUrl = '';
  isProfileLoading = false;
  isEditingProfile = false;
  isSavingProfile = false;

  message = '';
  isSubmitting = false;

  private apiUrl = 'http://127.0.0.1:8000/api/apply-job/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
     this.jobId = Number(
     this.route.snapshot.paramMap.get('id')
  );

    this.loadProfile();
   }

  loadProfile(): void {
  const token = this.authService.getToken();

  if (!token) {
    this.message = 'Please log in before applying for a job.';
    return;
  }

  this.isProfileLoading = true;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.get<any>(
    'http://127.0.0.1:8000/api/my-profile/',
    { headers }
  ).subscribe({
    next: (profile) => {
      this.fullName = profile.full_name || profile.username || '';
      this.email = profile.email || '';
      this.phone = profile.phone || '';
      this.skills = profile.skills || '';
      this.experience = profile.experience || '';
      this.savedResumeUrl = profile.resume || '';

      this.isProfileLoading = false;
    },
    error: (error) => {
      console.error('Error loading profile:', error);

      this.message = 'Unable to load your saved profile details.';

      this.isProfileLoading = false;
    }
  });
}
  

  saveProfile(): void {

  const token = this.authService.getToken();

  if (!token) {
    this.message = 'Please log in before updating your profile.';
    return;
  }

  const formData = new FormData();

  formData.append('full_name', this.fullName.trim());
  formData.append('phone', this.phone.trim());
  formData.append('skills', this.skills.trim());
  formData.append('experience', this.experience.trim());

  if (this.resumeFile) {
    formData.append(
      'resume',
      this.resumeFile,
      this.resumeFile.name
    );
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.isSavingProfile = true;
  this.message = '';

  this.http.put<any>(
    'http://127.0.0.1:8000/api/my-profile/',
    formData,
    { headers }
  ).subscribe({

    next: (response) => {

      const profile = response.profile;

      this.savedResumeUrl =
        profile?.resume || this.savedResumeUrl;

      this.resumeFile = null;
      this.isEditingProfile = false;
      this.isSavingProfile = false;

      this.message =
        response.message || 'Profile updated successfully!';
    },

    error: (error) => {

      console.error('Profile update error:', error);

      this.message =
        error.error?.message ||
        'Unable to update your profile. Please try again.';

      this.isSavingProfile = false;
    }

  });
}

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.resumeFile = null;
      return;
    }

    const file = input.files[0];
    const allowedFileName = /\.(pdf|doc|docx)$/i;

    if (!allowedFileName.test(file.name)) {
      this.message = 'Please select a PDF or Word document.';
      input.value = '';
      this.resumeFile = null;
      return;
    }

    this.resumeFile = file;
    this.message = '';
  }

  submitApplication(): void {

    if (!this.coverLetter.trim()) {
      this.message = 'Please enter your cover letter.';
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.message = 'Please log in before applying for a job.';
      return;
    }

    if (!this.jobId || Number.isNaN(this.jobId)) {
      this.message = 'Invalid job ID. Please return to the job listing.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const formData = new FormData();

    formData.append('job', String(this.jobId));
    formData.append('full_name', this.fullName.trim());
    formData.append('email', this.email.trim());
    formData.append('phone', this.phone.trim());
    formData.append('skills', this.skills.trim());
    formData.append('experience', this.experience.trim());
    formData.append('cover_letter', this.coverLetter.trim());

    if (this.resumeFile) {
      formData.append(
        'resume',
        this.resumeFile,
        this.resumeFile.name
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(
      this.apiUrl,
      formData,
      { headers }
    ).subscribe({
      next: (response) => {
        this.message =
          response.message ||
          'Application submitted successfully!';

        this.isSubmitting = false;
      },
      error: (error) => {
        this.message =
          error.error?.message ||
          'Unable to submit your application. Please try again.';

        this.isSubmitting = false;
      }
    });
  }

  goBackToJobDetails(): void {
    const jobId = this.route.snapshot.paramMap.get('id');

    if (jobId) {
      this.router.navigate(['/job-details', jobId]);
    } else {
      this.router.navigate(['/jobseeker-dashboard']);
    }
  }
}