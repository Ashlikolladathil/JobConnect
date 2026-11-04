
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';

import { AdminService } from '../admin.service';

import { AdminUsersService } from '../admin-users.service';

import { Router } from '@angular/router';

import { AdminJobsService } from '../admin-jobs.service';

import { AdminApplicationsService } from '../admin-applications.service';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AdminJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  required_skills: string;
  created_at: string;
  recruiter: string;
  status: string;
}

interface AdminApplicantDetails {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  skills: string;
  education: string;
  experience: string;
  resume_url: string | null;
  cover_letter: string;
}

interface AdminApplication {
  id: number;
  applicant: string;
  job_title: string;
  company: string;
  applied_at: string;
  status: string;
  rejection_reason: string;
  applicant_id?: number;
  applicant_details?: AdminApplicantDetails;
}


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  totalUsers = 0;
  totalJobSeekers = 0;
  totalApplications = 0;
  totalRecruiters = 0;
  totalJobs = 0;
  activeUsers = 0;

errorMessage = '';

users: AdminUser[] = [];
usersErrorMessage = '';
isLoadingUsers = false;
showUsers = false;

jobs: AdminJob[] = [];
jobSearchText = '';
selectedJobStatus = 'all';
jobsErrorMessage = '';
isLoadingJobs = false;
showJobs = false;


applications: AdminApplication[] = [];
selectedApplication: AdminApplication | null = null;
applicationSearchText = '';
selectedApplicationStatus = 'all';
selectedApplicationJob = 'all';
applicationsErrorMessage = '';
isLoadingApplications = false;
showApplications = false;

public barChartType: 'bar' = 'bar';

public barChartData: ChartData<'bar'> = {
  labels: ['Users','Job Seekers','Recruiters','Jobs','Applications','Active Users'],

  datasets: [
    {
      label: 'JobConnect Statistics',
      data: [0, 0, 0, 0]
    }
  ]
};

public barChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

// Application Status Doughnut Chart
public doughnutChartType: 'doughnut' = 'doughnut';
public doughnutChartPlugins = [ChartDataLabels];

public doughnutChartData: ChartData<'doughnut'> = {
  labels: ['Pending', 'Shortlisted', 'Rejected', 'Accepted'],
  datasets: [
    {
      data: [0, 0, 0, 0],
      backgroundColor: [
        '#F59E0B',
        '#3B82F6',
        '#EF4444',
        '#10B981'
      ],
      hoverOffset: 8,
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
};

 public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const value = Number(context.raw) || 0;
          const values = context.dataset.data.map(Number);
          const total = values.reduce((sum, item) => sum + item, 0);

          const percentage = total > 0
            ? ((value / total) * 100).toFixed(1)
            : '0.0';

          return ` ${context.label}: ${value} (${percentage}%)`;
        }
      }
    },
    datalabels: {
      display: true,
      color: '#ffffff',
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value, context) => {
        const values = context.dataset.data.map(Number);
        const total = values.reduce((sum, item) => sum + item, 0);

        return total > 0
          ? `${((Number(value) / total) * 100).toFixed(1)}%`
          : '';
      }
    }
  }
};

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private adminUsersService: AdminUsersService,
    private adminJobsService: AdminJobsService,
    private adminApplicationsService: AdminApplicationsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadApplicationStatusStats();
  }

  loadDashboardStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.totalUsers = data.total_users;
        this.totalJobSeekers = data.total_job_seekers;
        this.totalRecruiters = data.total_recruiters;
        this.totalJobs = data.total_jobs;
        this.totalApplications = data.total_applications;
        this.activeUsers = data.active_users;
        this.barChartData = {

  labels: [
  'Users',
  'Job Seekers',
  'Recruiters',
  'Jobs',
  'Applications',
  'Active Users'
  ],
  datasets: [
    {
      label: 'JobConnect Statistics',
     
      data: [
  this.totalUsers,
  this.totalJobSeekers,
  this.totalRecruiters,
  this.totalJobs,
  this.totalApplications,
  this.activeUsers
]
    }
  ]
};
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Dashboard statistics error:', error);
        this.errorMessage =
          'Unable to load statistics. Please check administrator access and the backend server.';
      }
    });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersErrorMessage = '';

    this.adminUsersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
        this.showUsers = true;
      },
      error: (error) => {
        console.error('User list error:', error);
        this.usersErrorMessage =
          'Unable to load users. Please check administrator permissions and the backend server.';
        this.isLoadingUsers = false;
      }
    });
  }

  toggleUsers(): void {
    if (this.showUsers) {
      this.showUsers = false;
    } else {
      this.loadUsers();
    }
  }

  searchText = '';
  selectedRole = 'all';
  selectedStatus = 'all';

  get filteredUsers(): AdminUser[] {
     return this.users.filter(user => {

      const matchesSearch =
        user.username.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesRole =
        this.selectedRole === 'all' ||
        user.role === this.selectedRole;

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.is_active) ||
        (this.selectedStatus === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
  });
}

  get filteredApplications(): AdminApplication[] {
  return this.applications.filter(application => {

    const search = this.applicationSearchText.toLowerCase().trim();

    const matchesSearch =
      application.applicant.toLowerCase().includes(search) ||
      application.job_title.toLowerCase().includes(search);

    const matchesStatus =
      this.selectedApplicationStatus === 'all' ||
      application.status === this.selectedApplicationStatus;

    const matchesJob =
      this.selectedApplicationJob === 'all' ||
      application.job_title === this.selectedApplicationJob;

    return matchesSearch && matchesStatus && matchesJob;
  });
}

  get filteredJobs(): AdminJob[] {
  return this.jobs.filter(job => {

    const search = this.jobSearchText.toLowerCase().trim();

    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search);

    const matchesStatus =
      this.selectedJobStatus === 'all' ||
      job.status === this.selectedJobStatus;

    return matchesSearch && matchesStatus;
  });
}

get applicationJobTitles(): string[] {
  return Array.from(
    new Set(
      this.applications
        .map(application => application.job_title)
        .filter(Boolean)
    )
  ).sort();
}

  loadJobs(): void {
  this.isLoadingJobs = true;
  this.jobsErrorMessage = '';

  this.adminJobsService.getJobs().subscribe({
    next: (data) => {
      this.jobs = data;
      this.showJobs = true;
      this.isLoadingJobs = false;
    },
    error: (error) => {
      console.error('Job list error:', error);
      this.jobsErrorMessage =
        'Unable to load jobs. Please check administrator permissions and the backend server.';
      this.isLoadingJobs = false;
    }
  });
}

toggleJobs(): void {
  if (this.showJobs) {
    this.showJobs = false;
  } else {
    this.loadJobs();
  }
}

loadApplications(): void {
  this.isLoadingApplications = true;
  this.applicationsErrorMessage = '';

  this.adminApplicationsService.getApplications().subscribe({
    next: (data) => {
      this.applications = data;
      this.showApplications = true;
      this.isLoadingApplications = false;
    },
    error: (error) => {
      console.error('Application list error:', error);
      this.applicationsErrorMessage =
        'Unable to load applications. Please check administrator permissions and the backend server.';
      this.isLoadingApplications = false;
    }
  });
}

toggleApplications(): void {
  if (this.showApplications) {
    this.showApplications = false;
  } else {
    this.loadApplications();
  }
}

// Open applicant details
showApplicationDetails(application: AdminApplication): void {
  this.selectedApplication = application;
}

// Close applicant details
closeApplicationDetails(): void {
  this.selectedApplication = null;
}

toggleAccountStatus(user: AdminUser): void {
  if (user.id === Number(localStorage.getItem('user_id'))) {
    alert('You cannot deactivate your own account.');
    return;
  }

  const action = user.is_active ? 'deactivate' : 'activate';

  if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) {
    return;
  }

  this.adminUsersService.toggleUserStatus(user.id).subscribe({
    next: (response) => {
      user.is_active = response.is_active;
      alert(response.message);
    },
    error: (error) => {
      console.error('Account status update error:', error);
      alert(error.error?.message || 'Unable to update the account status.');
    }
  });
}

    // Application Status Doughnut Chart
  loadApplicationStatusStats(): void {
    this.adminApplicationsService
      .getApplicationStatusStats()
      .subscribe({
        next: (data) => {
          this.doughnutChartData = {
            labels: [
              'Pending',
              'Shortlisted',
              'Rejected',
              'Accepted'
            ],
            datasets: [
              {
                data: [
                  data.pending,
                  data.shortlisted,
                  data.rejected,
                  data.accepted
                ],
                backgroundColor: [
                  '#F59E0B',
                  '#3B82F6',
                  '#EF4444',
                  '#10B981'
                ],
                hoverOffset: 8,
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            ]
          };
        },
        error: (error) => {
          console.error(
            'Application status statistics error:',
            error
          );
        }
      });
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}