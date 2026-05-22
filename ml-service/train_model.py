"""Train Random Forest models on synthetic patient data and save them."""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

FEATURES = [
    "age", "sex", "smoking", "family_history_heart",
    "heart_rate", "systolic_bp", "diastolic_bp", "temperature", "spo2",
    "weight", "bmi",
    "blood_glucose", "cholesterol", "hba1c", "creatinine",
    "chest_pain", "shortness_of_breath", "fatigue", "dizziness",
]

RISK_LABELS = ["Low", "Medium", "High"]

np.random.seed(42)
N = 5000


def generate_dataset():
    age = np.random.randint(18, 90, N)
    sex = np.random.randint(0, 2, N)
    smoking = np.random.choice([0, 1, 2], N, p=[0.5, 0.25, 0.25])
    family_history_heart = np.random.randint(0, 2, N)

    heart_rate = np.random.normal(75, 15, N).clip(40, 180).astype(int)
    systolic_bp = np.random.normal(120, 20, N).clip(80, 220).astype(int)
    diastolic_bp = (systolic_bp * 0.6 + np.random.normal(0, 8, N)).clip(50, 140).astype(int)
    temperature = np.random.normal(98.6, 1.2, N).clip(95, 106)
    spo2 = np.random.normal(97, 2, N).clip(80, 100)
    weight = np.random.normal(75, 20, N).clip(40, 200)
    height = np.random.normal(170, 10, N).clip(140, 210) / 100
    bmi = (weight / height ** 2).clip(15, 55)

    blood_glucose = np.random.normal(100, 30, N).clip(60, 400)
    cholesterol = np.random.normal(190, 40, N).clip(100, 400)
    hba1c = np.random.normal(5.5, 1.2, N).clip(4, 14)
    creatinine = np.random.normal(1.0, 0.4, N).clip(0.4, 10)

    chest_pain = np.random.randint(0, 2, N)
    shortness_of_breath = np.random.randint(0, 2, N)
    fatigue = np.random.randint(0, 2, N)
    dizziness = np.random.randint(0, 2, N)

    # Cardiovascular risk score (rule-based ground truth)
    cv_score = (
        (age > 55).astype(int) * 2
        + sex  # male slightly higher risk
        + smoking
        + family_history_heart * 2
        + (systolic_bp > 140).astype(int) * 2
        + (cholesterol > 240).astype(int) * 2
        + (bmi > 30).astype(int)
        + chest_pain * 3
        + shortness_of_breath * 2
        + (heart_rate > 100).astype(int)
        + (spo2 < 94).astype(int) * 2
        + np.random.randint(0, 3, N)  # noise
    )
    cv_risk = pd.cut(cv_score, bins=[-1, 4, 9, 100], labels=[0, 1, 2]).astype(int)

    # General severity score
    sev_score = (
        (temperature > 101).astype(int) * 2
        + (temperature < 96).astype(int) * 3
        + (spo2 < 92).astype(int) * 3
        + (heart_rate > 120).astype(int) * 2
        + (heart_rate < 50).astype(int) * 2
        + (systolic_bp > 180).astype(int) * 3
        + (systolic_bp < 90).astype(int) * 3
        + (blood_glucose > 300).astype(int) * 2
        + (creatinine > 3).astype(int) * 2
        + chest_pain * 2
        + shortness_of_breath * 2
        + fatigue
        + dizziness
        + np.random.randint(0, 3, N)
    )
    general_severity = pd.cut(sev_score, bins=[-1, 4, 9, 100], labels=[0, 1, 2]).astype(int)

    df = pd.DataFrame({
        "age": age, "sex": sex, "smoking": smoking,
        "family_history_heart": family_history_heart,
        "heart_rate": heart_rate, "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp, "temperature": temperature,
        "spo2": spo2, "weight": weight, "bmi": bmi,
        "blood_glucose": blood_glucose, "cholesterol": cholesterol,
        "hba1c": hba1c, "creatinine": creatinine,
        "chest_pain": chest_pain, "shortness_of_breath": shortness_of_breath,
        "fatigue": fatigue, "dizziness": dizziness,
        "cv_risk": cv_risk, "general_severity": general_severity,
    })
    return df


def train_and_save():
    df = generate_dataset()
    X = df[FEATURES]

    os.makedirs("models", exist_ok=True)

    for target, fname in [("cv_risk", "cv_model.pkl"), ("general_severity", "severity_model.pkl")]:
        y = df[target]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        clf = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
        clf.fit(X_train, y_train)
        score = clf.score(X_test, y_test)
        print(f"{target}: test accuracy = {score:.3f}")
        joblib.dump(clf, f"models/{fname}")

    joblib.dump(FEATURES, "models/features.pkl")
    joblib.dump(RISK_LABELS, "models/labels.pkl")
    print("Models saved to models/")


if __name__ == "__main__":
    train_and_save()
