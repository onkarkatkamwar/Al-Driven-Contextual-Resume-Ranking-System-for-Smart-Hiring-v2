from pydantic import BaseModel

class ResumeData(BaseModel):
    filename: str
    text: str

class ScoreResponse(BaseModel):
    filename: str
    ats_score: float
    details: dict