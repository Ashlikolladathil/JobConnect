from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ('jobseeker', 'Job Seeker'),
        ('recruiter', 'Recruiter'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    full_name = models.CharField(max_length=150, blank=True, default='')

    phone = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    resume = models.FileField(
        upload_to='resumes/',
        blank=True,
        null=True
        )

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    @property
    def profile_completion(self):
        total_fields = 5
        completed_fields = 0

        if self.user.username:
            completed_fields += 1

        if self.user.email:
            completed_fields += 1

        if self.phone:
            completed_fields += 1

        if self.location:
            completed_fields += 1

        if self.skills:
            completed_fields += 1

        return int((completed_fields / total_fields) * 100)