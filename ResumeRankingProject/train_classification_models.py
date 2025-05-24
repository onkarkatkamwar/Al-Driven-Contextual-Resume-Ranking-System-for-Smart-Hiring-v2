import json
import os
import re
import numpy as np
from datetime import datetime
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, Bidirectional, LSTM, Dense

import pickle

# === Load dataset ===
with open("resume_dataset.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [item["text"] for item in data]
domains = [item["domain"] for item in data]

# === Extract and calculate experience duration ===
def extract_experience_years(text):
    patterns = [
        r"(\d{1,2} \w{3,9}, \d{4})\s*-\s*(\d{1,2} \w{3,9}, \d{4})",
        r"(\w{3,9} \d{4})\s*-\s*(\w{3,9} \d{4})",
        r"(\d{2}/\d{4})\s*-\s*(\d{2}/\d{4})",
        r"(\d{4})\s*-\s*(\d{4})",
        r"(\w{3,9} \d{4})\s*-\s*(Present)"
    ]
    formats = ["%d %b, %Y", "%B %Y", "%m/%Y", "%Y", "%b %Y"]

    total_months = 0
    now = datetime.now()

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                start_str, end_str = match
                start_date = None
                end_date = None
                for fmt in formats:
                    try:
                        start_date = datetime.strptime(start_str, fmt)
                        break
                    except:
                        continue
                if end_str == "Present":
                    end_date = now
                else:
                    for fmt in formats:
                        try:
                            end_date = datetime.strptime(end_str, fmt)
                            break
                        except:
                            continue
                if start_date and end_date:
                    months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                    if months > 0:
                        total_months += months
            except:
                continue

    return total_months / 12  # return in years

# Calculate experience level from date ranges
experience_levels = []
for text in texts:
    years = extract_experience_years(text)
    if years < 2:
        experience_levels.append("Entry")
    elif 2 <= years <= 5:
        experience_levels.append("Mid")
    else:
        experience_levels.append("Senior")

# === Preprocessing ===
MAX_NUM_WORDS = 10000
MAX_SEQ_LENGTH = 200

# Tokenizer
tokenizer = Tokenizer(num_words=MAX_NUM_WORDS, oov_token="<OOV>")
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)
X = pad_sequences(sequences, maxlen=MAX_SEQ_LENGTH)

# Encode labels
domain_encoder = LabelEncoder()
y_domain = to_categorical(domain_encoder.fit_transform(domains))

experience_encoder = LabelEncoder()
y_experience = to_categorical(experience_encoder.fit_transform(experience_levels))

# Split dataset
X_train, X_test, y_domain_train, y_domain_test = train_test_split(X, y_domain, test_size=0.2, random_state=42)
_, _, y_experience_train, y_experience_test = train_test_split(X, y_experience, test_size=0.2, random_state=42)

# === Model architecture ===
def build_model(output_dim):
    model = Sequential()
    model.add(Embedding(input_dim=MAX_NUM_WORDS, output_dim=128, input_length=MAX_SEQ_LENGTH))
    model.add(Bidirectional(LSTM(64)))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(output_dim, activation='softmax'))
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

# === Train Domain Model ===
domain_model = build_model(y_domain.shape[1])
domain_model.fit(X_train, y_domain_train, validation_data=(X_test, y_domain_test), epochs=10, batch_size=8)

# === Train Experience Level Model ===
experience_model = build_model(y_experience.shape[1])
experience_model.fit(X_train, y_experience_train, validation_data=(X_test, y_experience_test), epochs=10, batch_size=8)

# === Save models and encoders ===
os.makedirs("models", exist_ok=True)
os.makedirs("encoders", exist_ok=True)

# Save models
domain_model.save("models/domain_model.h5")
experience_model.save("models/experience_model.h5")

# Save encoders with pickle
with open("encoders/domain_encoder.pkl", "wb") as f:
    pickle.dump(domain_encoder, f)

with open("encoders/experience_encoder.pkl", "wb") as f:
    pickle.dump(experience_encoder, f)

with open("encoders/tokenizer.pkl", "wb") as f:
    pickle.dump(tokenizer, f)

print("✅ Models and encoders saved with updated experience calculation!")
