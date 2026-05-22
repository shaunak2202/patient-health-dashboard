# Patient Health Dashboard

A full-stack app for entering patient vitals and getting ML-based risk predictions — with SHAP explanations showing *why* the model made each call.

I built this to get hands-on with SHAP and explainability. I'd used scikit-learn plenty before but always treated the model as a black box. I wanted to see what it actually looks like to surface feature contributions in a usable UI, especially in a domain (healthcare) where "the model said so" isn't good enough.

The full-stack side (React, Express, MongoDB) was new territory for me — I'm more comfortable in Python/ML — so this was also a chance to wire those pieces together for real.

---

## What it does

- Enter patient vitals, lab values, symptoms, and demographics via a tabbed form
- Sends data to a Python microservice that runs two Random Forest classifiers
- Returns **Cardiovascular Risk** and **General Severity** predictions (Low / Medium / High)
- Visualizes SHAP values as a waterfall chart — red bars increase risk, green bars decrease it
- Saves patient records to MongoDB so you can review past assessments

![Dashboard screenshot — add one here]()

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express, Mongoose |
| ML service | Python, FastAPI, scikit-learn, SHAP |
| Database | MongoDB |

---

## ML approach

Two `RandomForestClassifier` models trained on 5,000 synthetic patients generated with realistic clinical distributions and rule-based labels.

**Features (19):** age, sex, smoking status, family history, heart rate, systolic/diastolic BP, temperature, SpO₂, weight, BMI, blood glucose, cholesterol, HbA1c, creatinine, chest pain, shortness of breath, fatigue, dizziness.

SHAP `TreeExplainer` runs on each prediction and returns the top 10 feature contributions. The UI renders these as a horizontal bar chart — the main thing I wanted to understand when I started this.

---

## Running locally

**Prerequisites:** Python 3.11+, Node 20+, MongoDB running on port 27017

```bash
# One command — trains models, starts all 3 services
bash start-dev.sh
```

Then open [http://localhost:3000](http://localhost:3000).

Or with Docker:
```bash
docker compose up --build
```

The ML service auto-trains on first startup (~5 seconds). Models are saved to `ml-service/models/` and reused on restart.

**Environment:** copy `server/.env.example` to `server/.env` and adjust if needed.

---

## What I'd improve

- **Real dataset** — the synthetic training data works for demonstration but I'd want to retrain on something like the [UCI Heart Disease dataset](https://archive.ics.uci.edu/dataset/45/heart+disease) or MIMIC for credible predictions
- **Better model** — try XGBoost or a proper hyperparameter search; the RF was a starting point
- **Auth** — right now there's no login, so all patients are shared; a real clinical tool would need per-provider access

---

## Project structure

```
├── client/          # React frontend
├── server/          # Express API + MongoDB
├── ml-service/      # FastAPI + scikit-learn + SHAP
└── docker-compose.yml
```
