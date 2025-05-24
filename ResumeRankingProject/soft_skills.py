from fastapi import APIRouter
from resume_data import ResumeData

router = APIRouter()

def evaluate_soft_skills(text):
    soft_skills = ["communication", "teamwork", "leadership", "problem-solving", "adaptability", "collaboration"]
    score = sum(text.lower().count(skill) for skill in soft_skills) * 10  # Example scoring logic
    return min(score, 100)

@router.post("/evaluate-soft-skills")
async def evaluate_soft_skills_api(resume: ResumeData):
    soft_skill_score = evaluate_soft_skills(resume.text)
    return {"filename": resume.filename, "soft_skill_score": soft_skill_score}