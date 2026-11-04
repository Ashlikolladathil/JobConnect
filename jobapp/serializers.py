from rest_framework import serializers
from .models import Job, Application


class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company',
            'location',
            'description',
            'salary',
            'required_skills',
            'created_at',
        ]

class ApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'applicant',
            'applied_at',
            'status',
        ]
        read_only_fields = [
            'id',
            'applicant',
            'applied_at',
            'status',
        ]