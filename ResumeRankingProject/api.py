from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pdfplumber
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
import spacy
from tensorflow.keras.models import load_model
import pickle
from keras.utils import pad_sequences
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI app
app = FastAPI()

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NLP models
try:
    nlp = spacy.load("en_core_web_sm")
    embed_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

    # Load trained BiLSTM model & tokenizer
    model_path = os.path.join("saved_models", "bilstm_model.h5")
    tokenizer_path = os.path.join("saved_models", "tokenizer.pkl")

    bilstm_model = load_model(model_path)
    with open(tokenizer_path, "rb") as f:
        tokenizer = pickle.load(f)
except Exception as e:
    print(f"Error loading models: {e}")
    # Create dummy models for testing if needed
    nlp = None
    embed_model = None
    bilstm_model = None
    tokenizer = None

# Constants for text preprocessing (same as training)
max_len = 100  # must match your training max_len

# File paths
JD_PATH = "job_description.txt"
RESUME_FOLDER = "resumes"
RESULT_PATH = "ranked_results.json"

os.makedirs(RESUME_FOLDER, exist_ok=True)

def extract_text_from_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            texts = [p.extract_text() for p in pdf.pages if p.extract_text()]
            return "\n".join(texts)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def calculate_similarity(text1, text2):
    try:
        emb1 = embed_model.encode(text1, convert_to_tensor=True)
        emb2 = embed_model.encode(text2, convert_to_tensor=True)
        score = util.pytorch_cos_sim(emb1, emb2).item()
        return round(score * 100, 2)
    except Exception as e:
        print(f"Error calculating similarity: {e}")
        return "vidhhi"  # Return a default value

@app.post("/upload-jd")
async def upload_jd(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract text from the PDF
        jd_text = extract_text_from_pdf(temp_path)
        
        # Save the extracted text
        with open(JD_PATH, "w", encoding="utf-8") as f:
            f.write(jd_text)
            
        # Clean up the temporary file
        os.remove(temp_path)
        
        return {"message": "Job description uploaded successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Error uploading job description: {str(e)}"})

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    try:
        if not os.path.exists(JD_PATH):
            return JSONResponse(status_code=400, content={"error": "Job description not uploaded yet."})

        with open(JD_PATH, "r", encoding="utf-8") as f:
            jd_text = f.read()

        threshold = 0.5108  # Adjust as needed
        results = []

        for file in files:
            resume_path = os.path.join(RESUME_FOLDER, file.filename)
            with open(resume_path, "wb") as f:
                content = await file.read()
                f.write(content)

            resume_text = extract_text_from_pdf(resume_path)

            # Run ATS Agent Logic
            skill_match = calculate_similarity(jd_text, resume_text)
            experience_score = calculate_similarity("Experience in AI and ML", resume_text)
            soft_skills = calculate_similarity("Strong communication and collaboration", resume_text)
            adaptability = calculate_similarity("Adaptable to cross-industry roles", resume_text)

            final_score = round(
                (0.4 * skill_match) +
                (0.3 * experience_score) +
                (0.2 * soft_skills) +
                (0.1 * adaptability), 2
            )

            # Prepare text input for BiLSTM model using tokenizer and padding
            if tokenizer and bilstm_model:
                seq = tokenizer.texts_to_sequences([resume_text])
                padded_seq = pad_sequences(seq, maxlen=max_len, padding='post')
                prediction_prob = float(bilstm_model.predict(padded_seq)[0][0])
                predicted_class = int(prediction_prob > threshold)
            else:
                # Fallback if models aren't loaded
                prediction_prob = 0.55
                predicted_class = 1

            # Combined logic to decide label
            if final_score < 35 and prediction_prob < threshold:
                label = "Not Matched"
                predicted_class = 0
            else:
                label = "Matched"
                predicted_class = 1

            results.append({
                "resume_filename": file.filename,
                "skill_match": skill_match,
                "experience_score": experience_score,
                "soft_skills_score": soft_skills,
                "adaptability_score": adaptability,
                "final_ats_score": final_score,
                "bilstm_predicted_class": predicted_class,
                "bilstm_prediction_probability": round(prediction_prob, 4),
                "bilstm_label": label
            })

        # Sort and save results
        results.sort(key=lambda x: x["final_ats_score"], reverse=True)
        with open(RESULT_PATH, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)

        return {"message": "Resumes processed and ranked successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Error processing resumes: {str(e)}"})

@app.get("/ranked-results")
async def get_ranked_results():
    try:
        if not os.path.exists(RESULT_PATH):
            # For testing, return dummy data if no results exist
            dummy_results = [
                {
                    "resume_filename": "Civil_Engineer_Resume_Dummy.pdf",
                    "skill_match": 65.32,
                    "experience_score": 58.75,
                    "soft_skills_score": 42.18,
                    "adaptability_score": 39.45,
                    "final_ats_score": 55.21,
                    "bilstm_predicted_class": 1,
                    "bilstm_prediction_probability": 0.6723,
                    "bilstm_label": "Matched"
                }
            ]
            return dummy_results
            # Uncomment below to return error instead of dummy data
            # return JSONResponse(status_code=404, content={"error": "No ranking results found."})
        
        with open(RESULT_PATH, "r", encoding="utf-8") as f:
            results = json.load(f)
        
        return results
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Error retrieving results: {str(e)}"})

# Add a simple health check endpoint
@app.get("/")
async def root():
    return {"status": "API is running"}

# If you're running this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
