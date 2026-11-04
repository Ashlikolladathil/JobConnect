import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'jobseeker';
  skills = '';
  experience = '';

  message = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.message = '';

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.authService.register(
      this.username,
      this.email,
      this.password,
      this.role,
      this.skills,
      this.experience
    ).subscribe({
      next: (response) => {
        this.message =
          response.message ||
          'Registration successful! Please log in.';

        this.isSubmitting = false;
      },

      error: (error) => {
        this.message =
          error.error?.message ||
          'Registration failed. Please check your details and try again.';

        this.isSubmitting = false;

        console.error('Registration error:', error);
      }
    });
  }
}