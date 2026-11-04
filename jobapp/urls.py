from django.urls import path

from . import views


urlpatterns = [
    
    path('api/jobs/', views.job_list_api, name='job_list_api'),

    path(
        'api/jobs/<int:job_id>/match/',
         views.job_match_api,
         name='job_match_api'
        ),

    path(
      'api/apply-job/',
      views.apply_job_api,
      name='apply_job_api'
      ),

    path('', views.home, name='home'),

    path('job/<int:job_id>/', views.job_detail, name='job_detail'),

    path('add-job/', views.add_job, name='add_job'),

    path('edit-job/<int:job_id>/', views.edit_job, name='edit_job'),

    path('delete-job/<int:job_id>/', views.delete_job, name='delete_job'),

    path(
        'apply-job/<int:job_id>/',
        views.apply_for_job,
        name='apply_for_job'
       ),

    path(
       'my-applications/',
        views.my_applications,
        name='my_applications'
        ),

    path(
       'recruiter-applications/',
       views.recruiter_applications,
       name='recruiter_applications'
       ),

    path(
       'resume-analyzer/',
        views.resume_analyzer,
        name='resume_analyzer'
        ),
   
    path('api/my-applications/', views.my_applications_api, name='my_applications_api'),

    
    path('api/add-job/', views.add_job_api, name='add_job_api'),

    path('api/my-jobs/', views.my_jobs_api, name='my_jobs_api'),

    path('api/recruiter-applications/', views.recruiter_applications_api, name='recruiter_applications_api'),

    path('api/recruiter-applications/<int:application_id>/', views.update_application_status_api, name='update_application_status_api'),

    path('api/delete-job/<int:job_id>/', views.delete_job_api, name='delete_job_api'),

    path('api/edit-job/<int:job_id>/', views.edit_job_api, name='edit_job_api'),

    path(
    'api/resume-analyzer/',
    views.resume_analyzer_api,
    name='resume_analyzer_api'
    ),

    path(
    'api/admin-dashboard-stats/',
    views.admin_dashboard_stats_api,
    name='admin_dashboard_stats_api'
    ),

    path(
    'api/admin-users/',
    views.admin_user_list_api,
    name='admin_user_list_api'
 ),

path(
    'api/admin-jobs/',
    views.admin_job_list_api,
    name='admin_job_list_api'
    ),

path(
    'api/admin-applications/',
    views.admin_application_list_api,
    name='admin_application_list_api'
    ),

path(
    'api/admin-application-status-stats/',
    views.admin_application_status_stats_api,
    name='admin_application_status_stats_api'
    ),

]