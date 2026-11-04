import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { ApplyJobComponent } from './apply-job/apply-job.component';

import { JobseekerDashboardComponent } from './jobseeker-dashboard/jobseeker-dashboard.component';

import { RecruiterDashboardComponent } from './recruiter-dashboard/recruiter-dashboard.component';

import { JobDetailsComponent } from './job-details/job-details.component';

import { PostJobComponent } from './post-job/post-job.component';

import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

import { EditJobComponent } from './edit-job/edit-job.component';

import { RecruiterApplicationsComponent } from './recruiter-applications/recruiter-applications.component';

import { ResumeAnalyzerComponent } from './resume-analyzer/resume-analyzer.component';

import { adminAuthGuard } from './admin-auth.guard';

import { HomeComponent } from './home/home.component';

import { LoginComponent } from './login/login.component';

import { RegisterComponent } from './register/register.component';

const routes: Routes = [
    {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },

    {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'jobseeker-dashboard',
    component: JobseekerDashboardComponent
  },
  {
    path: 'recruiter-dashboard',
    component: RecruiterDashboardComponent
  },

  {
   path: 'job-details/:id',
   component: JobDetailsComponent
  },

  {
  path: 'apply-job/:id',
  component: ApplyJobComponent
  },

  {
  path: 'post-job',
  component: PostJobComponent
  },
  {
  path: 'manage-jobs', component: ManageJobsComponent 
  },

  { path: 'edit-job/:id', component: EditJobComponent },

  { path: 'recruiter-applications', component: RecruiterApplicationsComponent },

  {
  path: 'resume-analyzer',
  component: ResumeAnalyzerComponent
  },

  {
  path: 'admin-dashboard',
  component: AdminDashboardComponent,
  canActivate: [adminAuthGuard]
 },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }