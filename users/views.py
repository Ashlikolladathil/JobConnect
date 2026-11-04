from django.shortcuts import render, redirect, get_object_or_404

from django.contrib.auth.models import User

from jobapp.models import Job

from .forms import RegistrationForm, ProfileForm

from .models import UserProfile

from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from jobapp.ai_matching import calculate_match_percentage, get_skill_analysis

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)

        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password']
            )

            UserProfile.objects.create(
                user=user,
                role=form.cleaned_data['role']
            )

            return redirect('home')

    else:
        form = RegistrationForm()

    return render(request, 'users/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)

            # Check whether the user has a profile
            try:
                profile = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                # Allow admin users to access Django Admin
                if user.is_staff or user.is_superuser:
                    return redirect('/admin/')

                return render(request, 'users/login.html', {
                    'error': 'User profile not found. Please contact the administrator.'
                })

            if profile.role == 'recruiter':
                return redirect('recruiter_dashboard')

            return redirect('jobseeker_dashboard')

        return render(request, 'users/login.html', {
            'error': 'Invalid username or password.'
        })

    return render(request, 'users/login.html')

def user_logout(request):
    logout(request)
    return redirect('home')

@login_required
def dashboard(request):
    profile = UserProfile.objects.get(user=request.user)

    if profile.role == 'recruiter':
        return render(
            request,
            'users/recruiter_dashboard.html'
        )

    return render(
        request,
        'users/jobseeker_dashboard.html',
        {'profile': profile}
    )


@api_view(['POST'])
def login_api(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'message': 'Invalid email or password.'},
            status=400
        )

    user = authenticate(
        request,
        username=user_obj.username,
        password=password
    )

    if user is not None:

        if user.is_superuser or user.is_staff:
            role = 'admin'
        else:
            try:
                profile = UserProfile.objects.get(user=user)
                role = profile.role
            except UserProfile.DoesNotExist:
                return Response(
                    {'message': 'User profile not found.'},
                    status=400
                )

        # Generate JWT tokens for every successfully authenticated user
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful!',
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    return Response(
        {'message': 'Invalid email or password.'},
        status=400
    )


@login_required
def edit_profile(request):
    profile = get_object_or_404(UserProfile, user=request.user)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)

        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'users/edit_profile.html', {'form': form})

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

from .serializers import UserProfileSerializer

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile_api(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'message': 'User profile not found.'},
            status=404
        )

    # Retrieve profile information
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    # Update profile information
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully!',
                'profile': serializer.data
            })

        return Response(
            serializer.errors,
            status=400
        )


   
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_api(request):
    users = User.objects.all().order_by('-id')

    user_data = []

    for user in users:
        try:
            profile = UserProfile.objects.get(user=user)
            role = profile.role
        except UserProfile.DoesNotExist:
            role = 'admin' if user.is_staff or user.is_superuser else 'unknown'

        user_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
            'is_active': user.is_active,
        })

    return Response(user_data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_user_status_api(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'message': 'User not found.'},
            status=404
        )

    if user.id == request.user.id:
        return Response(
            {'message': 'You cannot deactivate your own account.'},
            status=400
        )

    if user.is_superuser:
        return Response(
            {'message': 'Superuser accounts cannot be deactivated here.'},
            status=403
        )

    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])

    return Response({
        'id': user.id,
        'username': user.username,
        'is_active': user.is_active,
        'message': (
            'Account activated.'
            if user.is_active
            else 'Account deactivated.'
        )
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    username = str(request.data.get('username', '')).strip()
    email = str(request.data.get('email', '')).strip()
    password = request.data.get('password', '')
    role = request.data.get('role', 'jobseeker')

    # Check required fields
    if not username or not email or not password:
        return Response(
            {'message': 'Please fill in all required fields.'},
            status=400
        )

    # Check password length
    if len(password) < 8:
        return Response(
            {'message': 'Password must contain at least 8 characters.'},
            status=400
        )

    # Allow only valid public registration roles
    if role not in ['jobseeker', 'recruiter']:
        return Response(
            {'message': 'Please select a valid account type.'},
            status=400
        )

    # Prevent duplicate usernames
    if User.objects.filter(username=username).exists():
        return Response(
            {'message': 'This username is already registered.'},
            status=400
        )

    # Prevent duplicate email addresses
    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {'message': 'This email address is already registered.'},
            status=400
        )
# Get the candidate's profile information
    skills = str(request.data.get('skills') or '').strip()
    experience = str(request.data.get('experience') or '').strip()

# Create the account and profile together
    from django.db import transaction

    with transaction.atomic():
      user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    UserProfile.objects.create(
        user=user,
        role=role,
        skills=skills,
        experience=experience
    )
   
    return Response(
        {'message': 'Registration successful! Please log in.'},
        status=201
    )