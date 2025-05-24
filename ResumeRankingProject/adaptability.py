
from fastapi import APIRouter
from resume_data import ResumeData

router = APIRouter()

def check_adaptability(text):
    adaptability_keywords = ["fast learner", "adapt", "new skills", "multitasking", "cross-functional"]
    score = sum(text.lower().count(word) for word in adaptability_keywords) * 10
    return min(score, 100)

@router.post("/check-adaptability")
async def check_adaptability_api(resume: ResumeData):
    adaptability_score = check_adaptability(resume.text)
    return {"filename": resume.filename, "adaptability_score": adaptability_score}
