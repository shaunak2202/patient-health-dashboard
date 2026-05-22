from pydantic import BaseModel, Field
from typing import Literal


class PatientInput(BaseModel):
    # Demographics
    age: int = Field(..., ge=1, le=120)
    sex: Literal[0, 1]  # 0=female, 1=male
    smoking: Literal[0, 1, 2]  # 0=never, 1=former, 2=current
    family_history_heart: Literal[0, 1]

    # Basic vitals
    heart_rate: int = Field(..., ge=20, le=300)
    systolic_bp: int = Field(..., ge=60, le=300)
    diastolic_bp: int = Field(..., ge=30, le=200)
    temperature: float = Field(..., ge=90.0, le=110.0)
    spo2: float = Field(..., ge=50.0, le=100.0)
    weight: float = Field(..., ge=10.0, le=500.0)
    bmi: float = Field(..., ge=10.0, le=70.0)

    # Lab values
    blood_glucose: float = Field(..., ge=40.0, le=800.0)
    cholesterol: float = Field(..., ge=50.0, le=600.0)
    hba1c: float = Field(..., ge=3.0, le=20.0)
    creatinine: float = Field(..., ge=0.1, le=20.0)

    # Symptoms
    chest_pain: Literal[0, 1]
    shortness_of_breath: Literal[0, 1]
    fatigue: Literal[0, 1]
    dizziness: Literal[0, 1]


class ShapEntry(BaseModel):
    feature: str
    value: float
    shap_value: float


class RiskResult(BaseModel):
    label: str
    probabilities: dict[str, float]
    shap_values: list[ShapEntry]
    base_value: float


class PredictionResponse(BaseModel):
    cardiovascular_risk: RiskResult
    general_severity: RiskResult
