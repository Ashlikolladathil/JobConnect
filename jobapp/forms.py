from django import forms
from .models import Job, Application


class JobForm(forms.ModelForm):
    class Meta:
        model = Job
        fields = ['title', 'company', 'location', 'description', 'salary']

class ApplicationForm(forms.ModelForm):

    class Meta:
        model = Application
        fields = ['cover_letter']

        widgets = {
            'cover_letter': forms.Textarea(attrs={
                'placeholder': 'Introduce yourself and explain why you are suitable for this job.',
                'rows': 5,
            }),
        }

class ApplicationStatusForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ['status', 'rejection_reason']
        widgets = {
            'rejection_reason': forms.Textarea(
                attrs={
                    'rows': 3,
                    'placeholder': 'Enter the reason for rejection'
                }
            )
        }
        

class ResumeAnalyzerForm(forms.Form):
    resume_text = forms.CharField(
        label='Resume Text',
        widget=forms.Textarea(attrs={
            'rows': 8,
            'placeholder': 'Paste your resume text here...'
        })
    )

    required_skills = forms.CharField(
        label='Required Job Skills',
        widget=forms.TextInput(attrs={
            'placeholder': 'Python, Django, SQL, HTML'
        })
    )