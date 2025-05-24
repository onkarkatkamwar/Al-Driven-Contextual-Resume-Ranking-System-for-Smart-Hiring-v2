from fastapi import APIRouter
from resume_data import ResumeData

router = APIRouter()

def analyze_experience(text):
    # Placeholder logic: Count years of experience in text (You can use NLP for better analysis)
    experience_keywords = ["years of experience", "worked at", "senior", "junior", "intern"]
    score = sum(text.lower().count(word) for word in experience_keywords) * 10  # Simple scoring logic
    return min(score, 100)  # Limit max score to 100

@router.post("/analyze-experience")
async def analyze_experience_api(resume: ResumeData):
    exp_score = analyze_experience(resume.text)
    return {"filename": resume.filename, "experience_score": exp_score}
