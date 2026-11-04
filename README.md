\# JobConnect – AI-Assisted Job Portal



JobConnect is a full-stack job portal application developed using Django REST Framework and Angular. It connects job seekers with recruiters and provides tools to manage job applications, analyze resumes, and evaluate skill matches.



\## Features



\### Job Seeker



\* User registration and login.

\* Professional profile management.

\* Skills, education and experience details.

\* Resume upload.

\* Browse and search job listings.

\* Apply for jobs.

\* Track application status.

\* View job match percentages.

\* Resume Analyzer with resume score, skills found, missing skills and suggestions.



\### Recruiter



\* Recruiter registration and login.

\* Create and manage job postings.

\* View applicants for posted jobs.

\* Review applicant profiles and resumes.

\* View applicant job-match percentages.

\* View resume analysis results.

\* Shortlist, accept or reject applications.

\* Provide rejection reasons.



\### Administrator



\* Admin dashboard with statistics and charts.

\* User management.

\* Activate and deactivate accounts.

\* Job management.

\* Application management.

\* Search and filter users, jobs and applications.

\* View detailed jobseeker profiles.



\## Resume Analysis and Job Matching



JobConnect includes skills-based analysis features:



\* Extracts text from PDF and DOCX resumes.

\* Identifies recognized skills.

\* Calculates resume scores.

\* Identifies missing skills.

\* Calculates job match percentages.

\* Provides suggestions for resume improvement.



The current implementation uses rule-based and keyword-based analysis rather than a trained machine-learning model.



\## Technology Stack



\*\*Backend\*\*



\* Python

\* Django

\* Django REST Framework

\* SQLite

\* JWT Authentication



\*\*Frontend\*\*



\* Angular

\* TypeScript

\* HTML

\* CSS



\*\*Additional Tools\*\*



\* Git and GitHub

\* PyPDF

\* Python-docx



\## Project Structure



```text

JobConnect/

│

├── frontend/          # Angular frontend

│

├── jobapp/            # Job and application management

│

├── jobconnect/        # Django project settings and URLs

│

├── users/             # User and profile management

│

├── manage.py

│

├── .gitignore

│

└── README.md

```



\## Installation and Setup



\### 1. Clone the Repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd JobConnect

```



\### 2. Backend Setup



Create a virtual environment:



```bash

py -m venv venv

```



Activate it using Windows CMD:



```cmd

venv\\Scripts\\activate

```



Install the required packages:



```bash

pip install django==6.1.2 djangorestframework djangorestframework-simplejwt django-cors-headers pypdf python-docx

```



Set your Django secret key in your local environment before running the application. Never publish the secret key.



Run database migrations:



```bash

py manage.py migrate

```



Create an administrator account:



```bash

py manage.py createsuperuser

```



Start the Django server:



```bash

py manage.py runserver

```



Backend URL:



http://127.0.0.1:8000/



\### 3. Frontend Setup



Open another terminal and navigate to the frontend:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Start Angular:



```bash

ng serve

```



Frontend URL:



http://localhost:4200/



\## Future Improvements



\* Advanced semantic resume matching.

\* More sophisticated AI-powered recommendations.

\* Improved analytics and reporting.

\* Additional recruiter and jobseeker features.



\## Author



\*\*Ashili Kolladathil\*\*



AI Powered Full Stack Developer



Project: JobConnect



