import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.message = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.message = 'Login successful!';

        if (response.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);

        } else if (response.role === 'recruiter') {
          this.router.navigate(['/recruiter-dashboard']);

        } else if (response.role === 'jobseeker') {
          this.router.navigate(['/jobseeker-dashboard']);

        } else {
          this.message =
            'Login successful, but the user role is missing.';
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