"""FastAPI ML microservice — risk prediction with SHAP explanations."""
import os
import numpy as np
import pandas as pd
import joblib
import shap
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import PatientInput, PredictionResponse, RiskResult, ShapEntry

app = FastAPI(title="Patient Risk ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

_cv_model = None
_sev_model = None
_features = None
_labels = None
_cv_explainer = None
_sev_explainer = None

FEATURE_LABELS = {
    "age": "Age",
    "sex": "Sex (Male)",
    "smoking": "Smoking Status",
    "family_history_heart": "Family History",
    "heart_rate": "Heart Rate",
    "systolic_bp": "Systolic BP",
    "diastolic_bp": "Diastolic BP",
    "temperature": "Temperature (°F)",
    "spo2": "SpO₂ (%)",
    "weight": "Weight (kg)",
    "bmi": "BMI",
    "blood_glucose": "Blood Glucose",
    "cholesterol": "Cholesterol",
    "hba1c": "HbA1c (%)",
    "creatinine": "Creatinine",
    "chest_pain": "Chest Pain",
    "shortness_of_breath": "Shortness of Breath",
    "fatigue": "Fatigue",
    "dizziness": "Dizziness",
}


def load_models():
    global _cv_model, _sev_model, _features, _labels, _cv_explainer, _sev_explainer
    if _cv_model is None:
        _features = joblib.load(os.path.join(MODELS_DIR, "features.pkl"))
        _labels = joblib.load(os.path.join(MODELS_DIR, "labels.pkl"))
        _cv_model = joblib.load(os.path.join(MODELS_DIR, "cv_model.pkl"))
        _sev_model = joblib.load(os.path.join(MODELS_DIR, "severity_model.pkl"))
        _cv_explainer = shap.TreeExplainer(_cv_model)
        _sev_explainer = shap.TreeExplainer(_sev_model)


def input_to_df(data: PatientInput) -> pd.DataFrame:
    load_models()
    row = {f: getattr(data, f) for f in _features}
    return pd.DataFrame([row])


def build_result(model, explainer, df: pd.DataFrame, labels) -> RiskResult:
    proba = model.predict_proba(df)[0]
    pred_class = int(np.argmax(proba))
    label = labels[pred_class]

    shap_vals = explainer.shap_values(df)
    # For multi-class RF, shap_values returns list[array] — pick predicted class
    if isinstance(shap_vals, list):
        class_shap = shap_vals[pred_class][0]
        base_val = float(explainer.expected_value[pred_class])
    else:
        class_shap = shap_vals[0]
        base_val = float(explainer.expected_value)

    entries = [
        ShapEntry(
            feature=FEATURE_LABELS.get(f, f),
            value=float(df.iloc[0][f]),
            shap_value=float(v),
        )
        for f, v in zip(_features, class_shap)
    ]
    entries.sort(key=lambda e: abs(e.shap_value), reverse=True)

    return RiskResult(
        label=label,
        probabilities={labels[i]: round(float(p), 4) for i, p in enumerate(proba)},
        shap_values=entries[:10],  # top 10 contributors
        base_value=base_val,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PatientInput):
    try:
        load_models()
        df = input_to_df(data)
        cv = build_result(_cv_model, _cv_explainer, df, _labels)
        sev = build_result(_sev_model, _sev_explainer, df, _labels)
        return PredictionResponse(cardiovascular_risk=cv, general_severity=sev)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
