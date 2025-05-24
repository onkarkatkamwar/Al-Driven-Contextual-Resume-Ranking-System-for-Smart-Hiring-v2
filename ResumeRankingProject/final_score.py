from fastapi import APIRouter
from pydantic import BaseModel
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
import pickle

router = APIRouter()

# ----------------- Define Request & Response Models ------------------
class ResumeScoreRequest(BaseModel):
    skill_score: float
    exp_score: float
    soft_skill_score: float
    adaptability_score: float
    resume_text: str

class ScoreResponse(BaseModel):
    final_score: float
    match_probability: float

# ----------------- Load Model & Tokenizer Once ------------------
model = load_model("model_training/bilstm_model.h5")
with open("model_training/tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

# ----------------- Prediction Function ------------------
def predict_resume_match(text):
    seq = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(seq, maxlen=100, padding='post')
    prediction = model.predict(padded)
    return float(prediction[0][0])

# ----------------- API Route ------------------
@router.post("/calculate-score", response_model=ScoreResponse)
async def calculate_final_score(data: ResumeScoreRequest):
    match_probability = predict_resume_match(data.resume_text)
    
    final_score = (
        (data.skill_score * 0.4)
        + (data.exp_score * 0.3)
        + (data.soft_skill_score * 0.2)
        + (data.adaptability_score * 0.1)
    )

    return {
        "final_score": final_score,
        "match_probability": match_probability
    }
