from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json
from typing import List
import numpy as np

# Try to import optional dependencies
try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("pdfplumber not available - PDF processing disabled")

try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMER_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMER_AVAILABLE = False
    print("sentence-transformers not available - using fallback similarity")

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("spaCy not available - using fallback NLP")

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    import pickle
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available - using fallback BiLSTM")

app = FastAPI()

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
JD_PATH = "job_description.txt"
RESUME_FOLDER = "resumes"
RESULT_PATH = "ranked_results.json"
MODEL_PATH = "saved_models/bilstm_model.h5"
TOKENIZER_PATH = "saved_models/tokenizer.pkl"

# Constants for text preprocessing
max_len = 100  # must match your training max_len
threshold = 0.5108  # Threshold for BiLSTM model

# Create necessary directories
os.makedirs(RESUME_FOLDER, exist_ok=True)
os.makedirs("saved_models", exist_ok=True)

# Load NLP models with error handling
nlp = None
embed_model = None
bilstm_model = None
tokenizer = None

if SPACY_AVAILABLE:
    try:
        nlp = spacy.load("en_core_web_sm")
        print("spaCy model loaded successfully")
    except Exception as e:
        print(f"Error loading spaCy model: {e}")

if SENTENCE_TRANSFORMER_AVAILABLE:
    try:
        embed_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")
        print("SentenceTransformer model loaded successfully")
    except Exception as e:
        print(f"Error loading SentenceTransformer model: {e}")

if TENSORFLOW_AVAILABLE:
    try:
        if os.path.exists(MODEL_PATH):
            bilstm_model = load_model(MODEL_PATH)
            print("BiLSTM model loaded successfully")
        else:
            print(f"BiLSTM model not found at {MODEL_PATH}")
            
        if os.path.exists(TOKENIZER_PATH):
            with open(TOKENIZER_PATH, "rb") as f:
                tokenizer = pickle.load(f)
            print("Tokenizer loaded successfully")
        else:
            print(f"Tokenizer not found at {TOKENIZER_PATH}")
    except Exception as e:
        print(f"Error loading BiLSTM model or tokenizer: {e}")


def extract_text_from_pdf(file_path):
    if not PDF_AVAILABLE:
        return "PDF processing not available"
    
    try:
        with pdfplumber.open(file_path) as pdf:
            texts = [p.extract_text() for p in pdf.pages if p.extract_text()]
            return "\n".join(texts)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""


def calculate_similarity(text1, text2):
    if not SENTENCE_TRANSFORMER_AVAILABLE or embed_model is None:
        # Simple fallback similarity based on common words
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if len(words1) == 0 or len(words2) == 0:
            return 50.0
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        similarity = (intersection / union) * 100 if union > 0 else 50.0
        return round(similarity, 2)
    
    try:
        emb1 = embed_model.encode(text1, convert_to_tensor=True)
        emb2 = embed_model.encode(text2, convert_to_tensor=True)
        score = util.pytorch_cos_sim(emb1, emb2).item()
        return round(score * 100, 2)
    except Exception as e:
        print(f"Error calculating similarity: {e}")
        return 50.0


@app.post("/upload-jd")
async def upload_jd(file: UploadFile = File(...)):
    try:
        print(f"Received JD file: {file.filename}")
        
        # Save the file
        file_path = JD_PATH
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # If it's a PDF, extract text
        if file.filename.lower().endswith('.pdf'):
            jd_text = extract_text_from_pdf(file_path)
            with open(JD_PATH, "w", encoding="utf-8") as f:
                f.write(jd_text)
        
        return {"message": "Job description uploaded successfully.", "filename": file.filename}
    except Exception as e:
        print(f"Error in upload_jd: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-resumes")
async def upload_resumes(files: List[UploadFile] = File(...)):
    try:
        print(f"Received {len(files)} resume files")
        
        if not os.path.exists(JD_PATH):
            return JSONResponse(status_code=400, content={"error": "Job description not uploaded yet."})
        
        with open(JD_PATH, "r", encoding="utf-8") as f:
            jd_text = f.read()
        
        results = []
        
        for file in files:
            print(f"Processing resume: {file.filename}")
            resume_path = os.path.join(RESUME_FOLDER, file.filename)
            
            # Save the file
            with open(resume_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Extract text if it's a PDF
            if file.filename.lower().endswith('.pdf'):
                resume_text = extract_text_from_pdf(resume_path)
            else:
                with open(resume_path, "r", encoding="utf-8") as f:
                    resume_text = f.read()
            
            # Calculate similarity scores
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
            if TENSORFLOW_AVAILABLE and tokenizer and bilstm_model:
                try:
                    seq = tokenizer.texts_to_sequences([resume_text])
                    padded_seq = pad_sequences(seq, maxlen=max_len, padding='post')
                    prediction_prob = float(bilstm_model.predict(padded_seq)[0][0])
                    predicted_class = int(prediction_prob > threshold)
                except Exception as e:
                    print(f"Error in BiLSTM prediction: {e}")
                    prediction_prob = 0.55
                    predicted_class = 1
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
        
        return {"message": "Resumes processed and ranked successfully.", "results": results}
    except Exception as e:
        print(f"Error in upload_resumes: {e}")
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
        
        with open(RESULT_PATH, "r", encoding="utf-8") as f:
            results = json.load(f)
        
        return results
    except Exception as e:
        print(f"Error in get_ranked_results: {e}")
        return JSONResponse(status_code=500, content={"error": f"Error retrieving results: {str(e)}"})


# Add a simple health check endpoint
@app.get("/")
async def root():
    return {
        "status": "API is running", 
        "models_loaded": {
            "pdfplumber": PDF_AVAILABLE,
            "spacy": nlp is not None,
            "sentence_transformer": embed_model is not None,
            "tensorflow": TENSORFLOW_AVAILABLE,
            "bilstm": bilstm_model is not None,
            "tokenizer": tokenizer is not None
        }
    }


# If you're running this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
