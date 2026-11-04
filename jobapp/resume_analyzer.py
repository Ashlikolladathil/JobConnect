def extract_skills(resume_text):
    skills_list = [
        'Python',
        'Django',
        'Flask',
        'HTML',
        'CSS',
        'JavaScript',
        'Angular',
        'SQL',
        'MySQL',
        'MongoDB',
        'Git',
        'REST API',
        'Machine Learning'
    ]

    found_skills = []

    resume_text = resume_text.lower()

    for skill in skills_list:
        if skill.lower() in resume_text:
            found_skills.append(skill)

    return found_skills

def calculate_resume_score(resume_text):
    skills_list = [
        'Python',
        'Django',
        'Flask',
        'HTML',
        'CSS',
        'JavaScript',
        'Angular',
        'SQL',
        'MySQL',
        'MongoDB',
        'Git',
        'REST API',
        'Machine Learning'
    ]

    found_skills = extract_skills(resume_text)

    score = (len(found_skills) / len(skills_list)) * 100

    return round(score, 2)

def find_missing_skills(resume_text, required_skills):
    found_skills = extract_skills(resume_text)

    candidate_set = {
        skill.lower() for skill in found_skills
    }

    required_set = {
        skill.strip().lower()
        for skill in required_skills.split(',')
        if skill.strip()
    }

    missing_skills = required_set - candidate_set

    skill_names = {
    skill.lower(): skill
    for skill in required_skills.split(',')
    if skill.strip()
  }
    return sorted(
        skill_names.get(skill, skill.upper() if skill.lower() == 'css' else skill.title())
        for skill in missing_skills
    ) 


def get_resume_suggestions(resume_text, required_skills):
    missing_skills = find_missing_skills(resume_text, required_skills)
    suggestions = []

    if missing_skills:
        suggestions.append(
            "Consider learning these job-related skills: "
            + ", ".join(missing_skills)
        )
        suggestions.append(
            "Practise missing skills by building small projects "
            "and adding them to your resume when completed."
        )
    else:
        suggestions.append(
            "All listed job skills were found in the resume. "
            "Provide specific examples of how you used them."
        )

    if len(resume_text.strip()) < 100:
        suggestions.append(
            "Add more details about your education, projects, "
            "and technical experience."
        )

    return suggestions

def calculate_job_match_percentage(resume_text, required_skills):
    found_skills = extract_skills(resume_text)

    candidate_set = {
        skill.lower() for skill in found_skills
    }

    required_set = {
        skill.strip().lower()
        for skill in required_skills.split(',')
        if skill.strip()
    }

    if not required_set:
        return 0

    matched_skills = candidate_set.intersection(required_set)

    percentage = (
        len(matched_skills) / len(required_set)
    ) * 100

    return round(percentage, 2)