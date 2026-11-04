def calculate_match_percentage(candidate_skills, required_skills):
    # Convert skills into lowercase sets
    candidate_set = {
        skill.strip().lower()
        for skill in candidate_skills.split(',')
        if skill.strip()
    }

    required_set = {
        skill.strip().lower()
        for skill in required_skills.split(',')
        if skill.strip()
    }

    # Avoid division by zero
    if not required_set:
        return 0

    # Find matching skills
    matched_skills = candidate_set.intersection(required_set)

    # Calculate percentage
    percentage = (len(matched_skills) / len(required_set)) * 100

    return round(percentage, 2)

def get_skill_analysis(candidate_skills, required_skills):
    candidate_set = {
        skill.strip().lower()
        for skill in candidate_skills.split(',')
        if skill.strip()
    }

    required_set = {
        skill.strip().lower()
        for skill in required_skills.split(',')
        if skill.strip()
    }

    matched_skills = candidate_set.intersection(required_set)
    missing_skills = required_set.difference(candidate_set)

    return {
        'matched_skills': sorted(matched_skills),
        'missing_skills': sorted(missing_skills)
    }