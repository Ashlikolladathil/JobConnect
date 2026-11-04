import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'JobConnect';

  email = '';
  password = '';
  message = '';
  showDashboard = false;
  isResumeAnalyzerRoute = false;
  isAdminDashboardRoute = false;
  isLoginRoute = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateCurrentRoute();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentRoute();
      });
  }

 updateCurrentRoute(): void {
  const currentUrl = this.router.url.split('?')[0];

  this.isLoginRoute =
    currentUrl === '/' ||
    currentUrl === '/login';

  this.isResumeAnalyzerRoute =
    currentUrl === '/resume-analyzer';

  this.isAdminDashboardRoute =
    currentUrl === '/admin-dashboard';

  this.showDashboard =
    currentUrl === '/jobseeker-dashboard' ||
    currentUrl === '/recruiter-dashboard';
}

  login(): void {
    this.message = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.message = 'Login successful!';

      if (response.role === 'admin') {
         this.router.navigate(['/admin-dashboard']);

       } else if (response.role === 'recruiter') {

         this.showDashboard = true;
         this.router.navigate(['/recruiter-dashboard']);

       } else if (response.role === 'jobseeker') {
         this.showDashboard = true;
         this.router.navigate(['/jobseeker-dashboard']);

       } else {
         this.message = 'Login successful, but the user role is missing.';
       }

        console.log('Login response:', response);
      },

      error: (error) => {
        this.message =
          error.error?.message ||
          'Login failed. Please check your email and password.';

        console.error('Login error:', error);
      }
    });
  }
}