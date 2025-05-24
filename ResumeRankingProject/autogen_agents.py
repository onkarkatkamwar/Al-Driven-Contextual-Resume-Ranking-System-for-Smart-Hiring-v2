import spacy
from sentence_transformers import SentenceTransformer, util
import autogen

# Load NLP Models
nlp = spacy.load("en_core_web_sm")  # Small model for text processing
bert_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")  # Embedding model for similarity

# Define Agents
orchestrator = autogen.AssistantAgent(name="Orchestrator")
job_requirements_agent = autogen.AssistantAgent(name="JobRequirementsExtractor")
skill_matching_agent = autogen.AssistantAgent(name="ResumeSkillMatcher")
experience_analysis_agent = autogen.AssistantAgent(name="ExperienceAnalyzer")
soft_skills_agent = autogen.AssistantAgent(name="SoftSkillsEvaluator")
adaptability_agent = autogen.AssistantAgent(name="CrossIndustryAdaptability")
ranking_agent = autogen.AssistantAgent(name="FinalRankingAgent")

# Extract Skills from Text
def extract_skills(text):
    doc = nlp(text)
    skills = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
    return set(skills)

# Calculate Similarity Score
def calculate_similarity(job_desc, resume_text):
    job_embedding = bert_model.encode(job_desc, convert_to_tensor=True)
    resume_embedding = bert_model.encode(resume_text, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(job_embedding, resume_embedding).item()
    return round(similarity * 100, 2)  # Convert to percentage

# Process Resume
def process_resume(job_description, resume_text):
    print("🔹 Extracting Job Requirements...")
    job_skills = extract_skills(job_description)

    print("🔹 Extracting Resume Skills...")
    resume_skills = extract_skills(resume_text)

    print(f"🔹 Job Skills: {job_skills}")
    print(f"🔹 Resume Skills: {resume_skills}")

    print("🔹 Matching Skills...")
    skill_match_score = calculate_similarity(job_description, resume_text)

    print("🔹 Analyzing Experience...")
    experience_score = calculate_similarity("Experience needed: 3+ years in AI", resume_text)

    print("🔹 Evaluating Soft Skills...")
    soft_skills_score = calculate_similarity("Strong communication, teamwork", resume_text)

    print("🔹 Checking Cross-Industry Adaptability...")
    adaptability_score = calculate_similarity("Adaptability to new industries", resume_text)

    print("🔹 Ranking Candidate...")
    final_score = (skill_match_score * 0.4) + (experience_score * 0.3) + (soft_skills_score * 0.2) + (adaptability_score * 0.1)

    return round(final_score, 2)

# Example test
if __name__ == "__main__":
    job_desc = "Looking for a Python Developer with 3+ years of experience in AI/ML. Strong communication and adaptability."
    resume = "John Doe, Python Developer, 4 years experience, skilled in AI, ML, NLP, communication, teamwork."

    print("🔹 Starting Resume Processing...")
    ranking_result = process_resume(job_desc, resume)
    print(f"🔹 Final Ranking Score: {ranking_result}%")