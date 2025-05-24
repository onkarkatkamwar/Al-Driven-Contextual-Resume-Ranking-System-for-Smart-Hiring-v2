import os
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from fastapi import APIRouter
from pydantic import BaseModel

# === Load Tokenizer and Encoders ===
with open("encoders/tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

with open("encoders/domain_encoder.pkl", "rb") as f:
    domain_encoder = pickle.load(f)

with open("encoders/experience_encoder.pkl", "rb") as f:
    experience_encoder = pickle.load(f)

# === Load Trained Models ===
domain_model = load_model("models/domain_model.h5")
experience_model = load_model("models/experience_model.h5")

# === Constants ===
MAX_SEQ_LENGTH = 200

# === API Input Schema ===
class ResumeText(BaseModel):
    resume_text: str

# === Preprocessing Function ===
def preprocess_text(text: str):
    sequence = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequence, maxlen=MAX_SEQ_LENGTH)
    return padded

# === FastAPI Router ===
router = APIRouter()

@router.post("/predict-domain")
def predict_domain(data: ResumeText):
    processed = preprocess_text(data.resume_text)
    prediction = domain_model.predict(processed)
    label = domain_encoder.inverse_transform([np.argmax(prediction)])
    return {"predicted_domain": label[0]}

@router.post("/predict-experience")
def predict_experience(data: ResumeText):
    processed = preprocess_text(data.resume_text)
    prediction = experience_model.predict(processed)
    label = experience_encoder.inverse_transform([np.argmax(prediction)])
    return {"predicted_experience_level": label[0]}
