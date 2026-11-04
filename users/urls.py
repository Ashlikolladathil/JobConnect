from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path(
        'jobseeker-dashboard/',
        views.dashboard,
        name='jobseeker_dashboard'
    ),
    path(
        'recruiter-dashboard/',
        views.dashboard,
        name='recruiter_dashboard'
    ),

    path('edit-profile/', views.edit_profile, name='edit_profile'),

    path('api/login/', views.login_api, name='login_api'),

    path(
    'api/register/',
    views.register_api,
    name='register_api'
    ),

    path(
      'api/jobs/<int:job_id>/match/',
       views.job_match_api,
       name='job_match_api'
    ),

    path(
    'api/my-profile/',
    views.my_profile_api,
    name='my_profile_api'
    ),

    path(
    'api/admin-users/<int:user_id>/toggle-status/',
    views.admin_toggle_user_status_api,
    name='admin_toggle_user_status_api'
    ),

]
