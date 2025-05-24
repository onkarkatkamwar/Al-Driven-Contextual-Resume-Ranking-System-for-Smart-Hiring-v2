from fastapi import APIRouter
from resume_data import ResumeData

router = APIRouter()

@router.post("/match-skills")
async def match_skills(resume: ResumeData):
    # Placeholder AI logic (replace with actual NLP model)
    score = 85  # Example score
    return {"filename": resume.filename, "skill_score": score}