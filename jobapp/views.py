from django.shortcuts import render, get_object_or_404 ,  redirect

from django.contrib.auth.decorators import login_required

from django.core.exceptions import PermissionDenied

from django.contrib import messages

from users.models import UserProfile

from .models import Job, Application

from .serializers import JobSerializer

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated, IsAdminUser

from rest_framework.response import Response

from django.contrib.auth.models import User

from .forms import JobForm, ApplicationForm, ApplicationStatusForm,ResumeAnalyzerForm

from .ai_matching import(calculate_match_percentage, get_skill_analysis)

from .resume_extractor import extract_resume_text

from .resume_analyzer import (
    extract_skills,calculate_resume_score,find_missing_skills,get_resume_suggestions,
      calculate_job_match_percentage)


def home(request):
    jobs = Job.objects.all()

    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)

            if profile.role == 'jobseeker':
                for job in jobs:
                    job.match_percentage = calculate_match_percentage(
                        profile.skills,
                        job.required_skills
                    )

                    job.skill_analysis = get_skill_analysis(
                        profile.skills,
                        job.required_skills
                    )

        except UserProfile.DoesNotExist:
            pass

    return render(
        request,
        'jobapp/home.html',
        {'jobs': jobs}
    )

def job_detail(request, job_id):
    job = get_object_or_404(Job, id=job_id)
    return render(request, 'jobapp/job_detail.html', {'job': job})

@login_required
def add_job(request):
    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    if profile.role != 'recruiter':
        raise PermissionDenied

    if request.method == 'POST':
        form = JobForm(request.POST)

        if form.is_valid():
            job = form.save(commit=False)
            job.recruiter = request.user
            job.save()

            return redirect('home')
    else:
        form = JobForm()

    return render(
        request,
        'jobapp/add_job.html',
        {'form': form}
    )


@login_required
def edit_job(request, job_id):
    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    if profile.role != 'recruiter':
        raise PermissionDenied

    job = get_object_or_404(
        Job,
        id=job_id,
        recruiter=request.user
    )

    if request.method == 'POST':
        form = JobForm(request.POST, instance=job)

        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = JobForm(instance=job)

    return render(
        request,
        'jobapp/edit_job.html',
        {'form': form, 'job': job}
    )


@login_required
def delete_job(request, job_id):
    profile = get_object_or_404(UserProfile, user=request.user)

    if profile.role != 'recruiter':
        raise PermissionDenied

    job = get_object_or_404(Job, id=job_id , recruiter=request.user)

    if request.method == 'POST':
        job.delete()
        return redirect('home')

    return render(request, 'jobapp/delete_job.html', {'job': job})

@login_required
def apply_for_job(request, job_id):
    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    if profile.role != 'jobseeker':
        raise PermissionDenied

    job = get_object_or_404(Job, id=job_id)

    if Application.objects.filter(
        job=job,
        applicant=request.user
    ).exists():
        messages.warning(
            request,
            'You have already applied for this job.'
        )
        return redirect('job_detail', job_id=job.id)

    if request.method == 'POST':
        form = ApplicationForm(request.POST)

        if form.is_valid():
            application = form.save(commit=False)
            application.job = job
            application.applicant = request.user
            application.save()

            messages.success(
                request,
                'Your application was submitted successfully!'
            )

            return redirect('job_detail', job_id=job.id)

    else:
        form = ApplicationForm()

    return render(
        request,
        'jobapp/apply_for_job.html',
        {'form': form, 'job': job}
    )

@login_required
def my_applications(request):
    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    if profile.role != 'jobseeker':
        raise PermissionDenied

    applications = Application.objects.filter(
        applicant=request.user
    ).select_related('job').order_by('-applied_at')

    return render(
        request,
        'jobapp/my_applications.html',
        {'applications': applications}
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications_api(request):

    applications = Application.objects.filter(
        applicant=request.user
    ).select_related('job').order_by('-applied_at')

    data = []

    for application in applications:
        data.append({
            'id': application.id,
            'job_id': application.job.id,
            'job_title': application.job.title,
            'company': application.job.company,
            'status': application.status,
            'applied_at': application.applied_at,
            'rejection_reason': application.rejection_reason,
        })

    return Response(data)

@login_required
def recruiter_applications(request):
    profile = get_object_or_404(
        UserProfile,
        user=request.user
    )

    if profile.role != 'recruiter':
        raise PermissionDenied

    if request.method == 'POST':
        application_id = request.POST.get('application_id')

        application = get_object_or_404(
            Application,
            id=application_id,
            job__recruiter=request.user
        )

        form = ApplicationStatusForm(
            request.POST,
            instance=application
        )

        if form.is_valid():
            form.save()
            messages.success(
                request,
                'Application status updated successfully!'
            )
            return redirect('recruiter_applications')

    applications = Application.objects.filter(
        job__recruiter=request.user
    ).select_related(
        'job', 'applicant'
    ).order_by('-applied_at')

    forms = {
        application.id: ApplicationStatusForm(
            instance=application
        )
        for application in applications
    }

    return render(
        request,
        'jobapp/recruiter_applications.html',
        {
            'applications': applications,
            'forms': forms
        }
    )

def resume_analyzer(request):
    result = None

    if request.method == 'POST':
        form = ResumeAnalyzerForm(request.POST)

        if form.is_valid():
            resume_text = form.cleaned_data['resume_text']
            print("Resume Analyzer form submitted successfully!")
            required_skills = form.cleaned_data['required_skills']

            result = {
                'skills_found': extract_skills(resume_text),
                'resume_score': calculate_resume_score(resume_text),
                'missing_skills': find_missing_skills(
                    resume_text,
                    required_skills
                ),
                'suggestions': get_resume_suggestions(
                    resume_text,
                    required_skills
                ),

                'job_match_percentage': calculate_job_match_percentage(
                                        resume_text,
                                        required_skills
                ),
            }
    else:
        form = ResumeAnalyzerForm()

    return render(
        request,
        'jobapp/resume_analyzer.html',
        {
            'form': form,
            'result': result
        }
    )

@api_view(['GET'])
def job_list_api(request):
    jobs = Job.objects.all().order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job_api(request):

    # Get the applicant's profile
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    # Only job seekers can apply
    if profile.role != 'jobseeker':
        return Response(
            {'message': 'Only job seekers can apply for jobs.'},
            status=403
        )

    # Get the job
    job_id = request.data.get('job')

    if not job_id:
        return Response(
            {'message': 'Job ID is required.'},
            status=400
        )

    job = get_object_or_404(Job, id=job_id)

    # Prevent duplicate applications
    if Application.objects.filter(
        job=job,
        applicant=request.user
    ).exists():
        return Response(
            {'message': 'You have already applied for this job.'},
            status=400
        )

    # Get submitted information
    full_name = str(
        request.data.get('full_name') or ''
    ).strip()

    phone = str(
        request.data.get('phone') or ''
    ).strip()

    skills = str(
        request.data.get('skills') or ''
    ).strip()

    experience = str(
        request.data.get('experience') or ''
    ).strip()

    cover_letter = str(
        request.data.get('cover_letter') or ''
    ).strip()

    # Use existing profile information when fields are empty
    if not full_name:
        full_name = (
            profile.full_name
            or f'{request.user.first_name} {request.user.last_name}'.strip()
            or request.user.username
        )

    if not phone:
        phone = profile.phone

    if not skills:
        skills = profile.skills

    if not experience:
        experience = profile.experience

    # Update the job seeker's profile automatically
    profile.full_name = full_name
    profile.phone = phone
    profile.skills = skills
    profile.experience = experience

    # Save a newly uploaded resume to the profile
    uploaded_resume = request.FILES.get('resume')

    if uploaded_resume:
        profile.resume = uploaded_resume

    profile.save()

    # Save a separate application record
    application = Application.objects.create(
        job=job,
        applicant=request.user,
        full_name=full_name,
        email=request.user.email,
        phone=phone,
        skills=skills,
        experience=experience,
        cover_letter=cover_letter,
        resume=profile.resume if profile.resume else None
    )

    return Response({
        'message': 'Application submitted successfully!',
        'application_id': application.id,
        'job_id': job.id,
        'status': application.status
    }, status=201)

@api_view(['POST'])
def add_job_api(request):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in to post a job.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can post jobs.'},
            status=403
        )

    required_fields = [
        'title',
        'company',
        'location',
        'description',
        'salary'
    ]

    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'message': f'{field.capitalize()} is required.'},
                status=400
            )

    job = Job.objects.create(
        recruiter=request.user,
        title=request.data['title'],
        company=request.data['company'],
        location=request.data['location'],
        description=request.data['description'],
        salary=request.data['salary'],
        required_skills=request.data.get('required_skills', '')
    )

    return Response(
        {
            'message': 'Job posted successfully!',
            'job_id': job.id,
            'title': job.title
        },
        status=201
    )

@api_view(['GET'])
def my_jobs_api(request):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in to view your jobs.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can view their posted jobs.'},
            status=403
        )

    jobs = Job.objects.filter(
        recruiter=request.user
    ).order_by('-created_at')

    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def delete_job_api(request, job_id):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in to delete a job.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can delete jobs.'},
            status=403
        )

    try:
        job = Job.objects.get(
            id=job_id,
            recruiter=request.user
        )
    except Job.DoesNotExist:
        return Response(
            {'message': 'Job not found or you do not own this job.'},
            status=404
        )

    job.delete()

    return Response(
        {'message': 'Job deleted successfully.'},
        status=200
    )

@api_view(['PUT'])
def edit_job_api(request, job_id):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in to edit a job.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can edit jobs.'},
            status=403
        )

    try:
        job = Job.objects.get(
            id=job_id,
            recruiter=request.user
        )
    except Job.DoesNotExist:
        return Response(
            {'message': 'Job not found or you do not own this job.'},
            status=404
        )

    required_fields = [
        'title',
        'company',
        'location',
        'description',
        'salary'
    ]

    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'message': f'{field.capitalize()} is required.'},
                status=400
            )

    job.title = request.data['title']
    job.company = request.data['company']
    job.location = request.data['location']
    job.description = request.data['description']
    job.salary = request.data['salary']
    job.required_skills = request.data.get('required_skills', '')
    job.save()

    return Response({
        'message': 'Job updated successfully!',
        'job_id': job.id,
        'title': job.title
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_applications_api(request):

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can view applications.'},
            status=403
        )

    # Get jobs posted by this recruiter
    jobs = Job.objects.filter(
        recruiter=request.user
    ).prefetch_related(
        'applications__applicant'
    ).order_by('-created_at')

    data = []

    for job in jobs:

        applicants = []

        job_applications = sorted(
            job.applications.all(),
            key=lambda app: app.applied_at,
            reverse=True
        )

        for application in job_applications:

            # -----------------------------
            # 1. JOB MATCH ANALYSIS
            # -----------------------------

            candidate_skills = application.skills or ''
            required_skills = job.required_skills or ''

            match_percentage = calculate_match_percentage(
                candidate_skills,
                required_skills
            )

            skill_analysis = get_skill_analysis(
                candidate_skills,
                required_skills
            )

            # -----------------------------
            # 2. RESUME ANALYSIS
            # -----------------------------

            resume_analysis = None

            if application.resume:

                try:
                    application.resume.open('rb')

                    try:
                        resume_text = extract_resume_text(
                            application.resume
                        )
                    finally:
                        application.resume.close()

                    if resume_text.strip():

                        skills_found = extract_skills(resume_text)

                        resume_missing_skills = find_missing_skills(
                            resume_text,
                            required_skills
                        )

                        resume_matched_skills = [
                            skill
                            for skill in required_skills.split(',')
                            if skill.strip()
                            and skill.strip().lower() in {
                                found.lower()
                                for found in skills_found
                            }
                        ]

                        resume_analysis = {
                            'resume_score': calculate_resume_score(
                                resume_text
                            ),

                            'skills_found': skills_found,

                            'matched_skills': resume_matched_skills,

                            'missing_skills': resume_missing_skills,

                            'suggestions': get_resume_suggestions(
                                resume_text,
                                required_skills
                            ),

                            'job_match_percentage': calculate_job_match_percentage(
                                resume_text,
                                required_skills
                            )
                        }

                except Exception:
                    resume_analysis = {
                        'error': 'Unable to analyze the uploaded resume.'
                    }

            # -----------------------------
            # 3. APPLICANT DETAILS
            # -----------------------------

            applicants.append({

                'id': application.id,
                'applicant_id': application.applicant.id,

                'applicant_name': (
                    application.full_name
                    or application.applicant.username
                ),

                'applicant_email': (
                    application.email
                    or application.applicant.email
                ),

                'applicant_phone': application.phone,
                'applicant_skills': application.skills,
                'applicant_experience': application.experience,
                'cover_letter': application.cover_letter,

                'resume_url': (
                    request.build_absolute_uri(application.resume.url)
                    if application.resume else None
                ),

                # Job Match Results
                'job_match': {
                    'match_percentage': match_percentage,
                    'matched_skills': skill_analysis['matched_skills'],
                    'missing_skills': skill_analysis['missing_skills']
                },

                # Resume Analysis Results
                'resume_analysis': resume_analysis,

                'applied_at': application.applied_at,
                'status': application.status,
                'rejection_reason': application.rejection_reason,

            })

        # -----------------------------
        # 4. JOB DETAILS
        # -----------------------------

        data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'salary': job.salary,
            'required_skills': job.required_skills,
            'applicant_count': len(applicants),
            'applications': applicants
        })

    return Response(data)

@api_view(['PATCH'])
def update_application_status_api(request, application_id):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'recruiter':
        return Response(
            {'message': 'Only recruiters can update application status.'},
            status=403
        )

    try:
        application = Application.objects.get(
            id=application_id,
            job__recruiter=request.user
        )
    except Application.DoesNotExist:
        return Response(
            {'message': 'Application not found.'},
            status=404
        )

    new_status = request.data.get('status')

    valid_statuses = ['pending', 'shortlisted', 'rejected', 'accepted']

    if new_status not in valid_statuses:
        return Response(
            {'message': 'Invalid application status.'},
            status=400
        )

    application.status = new_status

    if new_status == 'rejected':
        application.rejection_reason = request.data.get(
            'rejection_reason', ''
        ).strip()
    else:
        application.rejection_reason = ''

    application.save()

    return Response({
        'message': 'Application status updated successfully.',
        'id': application.id,
        'status': application.status,
        'rejection_reason': application.rejection_reason
    })

@api_view(['GET'])
def job_match_api(request, job_id):
    if not request.user.is_authenticated:
        return Response(
            {'message': 'Please log in.'},
            status=401
        )

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=400
        )

    if profile.role != 'jobseeker':
        return Response(
            {'message': 'Only job seekers can check job matches.'},
            status=403
        )

    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response(
            {'message': 'Job not found.'},
            status=404
        )

    candidate_skills = profile.skills or ''
    required_skills = job.required_skills or ''

    match_percentage = calculate_match_percentage(
        candidate_skills,
        required_skills
    )

    skill_analysis = get_skill_analysis(
        candidate_skills,
        required_skills
    )

    return Response({
        'job_id': job.id,
        'job_title': job.title,
        'match_percentage': match_percentage,
        'matched_skills': skill_analysis['matched_skills'],
        'missing_skills': skill_analysis['missing_skills']
    })

@api_view(['POST'])
def resume_analyzer_api(request):
    uploaded_file = request.FILES.get('resume')
    resume_text = request.data.get('resume_text', '')
    required_skills = request.data.get('required_skills', '')

    if not isinstance(required_skills, str):
        return Response(
            {'message': 'Required skills must be text.'},
            status=400
        )

    if uploaded_file:
        filename = uploaded_file.name.lower()

        if not filename.endswith(('.pdf', '.docx')):
            return Response(
                {'message': 'Please upload a PDF or DOCX file.'},
                status=400
            )

        if uploaded_file.size > 5 * 1024 * 1024:
            return Response(
                {'message': 'File size must not exceed 5 MB.'},
                status=400
            )

        try:
            resume_text = extract_resume_text(uploaded_file)
        except Exception:
            return Response(
                {'message': 'Unable to read the resume file.'},
                status=400
            )
                # Return extracted text when Angular requests extraction only
        extract_only = str(
            request.data.get('extract_only', '')
        ).lower()

        if extract_only in ['true', '1', 'yes']:
            return Response({
                'resume_text': resume_text
            })

    if not isinstance(resume_text, str) or not resume_text.strip():
        return Response(
            {'message': 'Please provide resume text or upload a readable resume.'},
            status=400
        )

    result = {
        'skills_found': extract_skills(resume_text),
        'resume_score': calculate_resume_score(resume_text),
        'missing_skills': find_missing_skills(
            resume_text,
            required_skills
        ),
        'suggestions': get_resume_suggestions(
            resume_text,
            required_skills
        ),
        'job_match_percentage': calculate_job_match_percentage(
            resume_text,
            required_skills
        ),
    }

    return Response(result)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats_api(request):

    # Total registered users
    total_users = User.objects.count()

    # Total job seekers
    total_job_seekers = UserProfile.objects.filter(
        role='jobseeker'
    ).count()

    # Total recruiters
    total_recruiters = UserProfile.objects.filter(
        role='recruiter'
    ).count()

    # Total posted jobs
    total_jobs = Job.objects.count()

    # Total submitted applications
    total_applications = Application.objects.count()

    # Total active user accounts
    active_users = User.objects.filter(
        is_active=True
    ).count()

    return Response({
        'total_users': total_users,
        'total_job_seekers': total_job_seekers,
        'total_recruiters': total_recruiters,
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'active_users': active_users,
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_list_api(request):
    users = User.objects.all().order_by('id')

    user_data = []

    for user in users:
        if user.is_superuser:
            role = 'admin'
        elif user.is_staff:
            role = 'admin'
        else:
            try:
                profile = UserProfile.objects.get(user=user)
                role = profile.role
            except UserProfile.DoesNotExist:
                role = 'unknown'

        user_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
            'is_active': user.is_active,
        })

    return Response(user_data)

    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_job_list_api(request):
    jobs = Job.objects.select_related('recruiter').order_by('-created_at')

    job_data = []

    for job in jobs:
        job_data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'salary': job.salary,
            'required_skills': job.required_skills,
            'status': job.status,
            'created_at': job.created_at,
            'recruiter': (
                job.recruiter.username
                if job.recruiter
                else 'Unknown'
            ),
        })

    return Response(job_data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_application_list_api(request):

    applications = Application.objects.select_related(
        'job', 'applicant'
    ).order_by('-applied_at')

    application_data = []

    for application in applications:

        # Get the jobseeker's profile
        try:
            profile = UserProfile.objects.get(
                user=application.applicant
            )
        except UserProfile.DoesNotExist:
            profile = None

        # Get resume URL
        resume_url = None

        if application.resume:
            resume_url = request.build_absolute_uri(
                application.resume.url
            )

        if not resume_url and profile and profile.resume:
            resume_url = request.build_absolute_uri(
                profile.resume.url
            )

        # Applicant details
        applicant_details = {
            'id': application.applicant.id,
            'username': application.applicant.username,

            'full_name': (
                application.full_name
                or (profile.full_name if profile else '')
                or application.applicant.get_full_name()
            ),

            'email': (
                application.email
                or application.applicant.email
            ),

            'phone': (
                application.phone
                or (profile.phone if profile else '')
            ),

            'location': (
                profile.location if profile else ''
            ),

            'skills': (
                application.skills
                or (profile.skills if profile else '')
            ),

            'education': (
                getattr(profile, 'education', '') if profile else ''
            ),

            'experience': (
                application.experience
                or (profile.experience if profile else '')
            ),

            'resume_url': resume_url,
            'cover_letter': application.cover_letter,
        }

        application_data.append({
            'id': application.id,
            'applicant': application.applicant.username,
            'job_title': application.job.title,
            'company': application.job.company,
            'applied_at': application.applied_at,
            'status': application.status,
            'rejection_reason': application.rejection_reason,

            'applicant_id': application.applicant.id,
            'applicant_details': applicant_details,
        })

    return Response(application_data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_application_status_stats_api(request):
    status_counts = {
        'pending': Application.objects.filter(status='pending').count(),
        'shortlisted': Application.objects.filter(status='shortlisted').count(),
        'rejected': Application.objects.filter(status='rejected').count(),
        'accepted': Application.objects.filter(status='accepted').count(),
    }

    return Response(status_counts)



