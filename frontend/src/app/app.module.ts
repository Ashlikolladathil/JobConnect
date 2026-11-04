import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

import { AuthService } from './auth.service';

import { JobseekerDashboardComponent } from './jobseeker-dashboard/jobseeker-dashboard.component';

import { RecruiterDashboardComponent } from './recruiter-dashboard/recruiter-dashboard.component';

import { JobDetailsComponent } from './job-details/job-details.component';

import { ApplyJobComponent } from './apply-job/apply-job.component';

import { PostJobComponent } from './post-job/post-job.component';

import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';

import { EditJobComponent } from './edit-job/edit-job.component';

import { RecruiterApplicationsComponent } from './recruiter-applications/recruiter-applications.component';

import { ResumeAnalyzerComponent } from './resume-analyzer/resume-analyzer.component';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

import { NgChartsModule } from 'ng2-charts';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [
    AppComponent,
    JobseekerDashboardComponent,
    RecruiterDashboardComponent,
    JobDetailsComponent,
    ApplyJobComponent,
    PostJobComponent,
    ManageJobsComponent,
    EditJobComponent,
    RecruiterApplicationsComponent,
    ResumeAnalyzerComponent,
    AdminDashboardComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }