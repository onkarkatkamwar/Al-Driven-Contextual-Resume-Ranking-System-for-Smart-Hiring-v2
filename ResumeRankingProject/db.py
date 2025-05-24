from pymongo import MongoClient

# Local MongoDB default URI (works with Compass too)
client = MongoClient("mongodb://localhost:27017/")
client = MongoClient("mongodb://localhost:27017/")


# Create/use the main database
db = client["resume_ranking_db"]

# Collections
job_collection = db["jobs"]
resume_collection = db["resumes"]
