
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    profile_completion = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'username',
            'email',
            'role',
            'full_name',
            'phone',
            'location',
            'skills',
            'experience',
            'resume',
            'profile_completion'
        ]
        read_only_fields = ['id', 'role']
