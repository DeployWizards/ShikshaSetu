from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from services.ml_service import get_model

router = APIRouter()
model = get_model()

class StudentData(BaseModel):
    Gender: str
    Region: str
    Distance_km: float
    No_of_Siblings: int
    Family_Income: str
    Father_Education: str
    Mother_Education: str
    Internet_Access: str
    Stream: str
    Class_10_Percentage: float
    Class_11_Percentage: float
    Attendance_Percentage: float

@router.post("/predict")
def predict_dropout(data: StudentData):
    if model is None:
        return {"error": "ML Model is not loaded"}
        
    student_dict = data.dict()
    input_df = pd.DataFrame([student_dict])
    
    prediction = int(model.predict(input_df)[0])
    
    # Safely extract probability
    try:
        proba_array = model.predict_proba(input_df)
        if proba_array.ndim == 2 and proba_array.shape[1] > 1:
            probability = float(proba_array[0][1])
        else:
            probability = float(proba_array[0])
    except Exception:
        # Fallback if model doesn't support predict_proba
        probability = float(prediction)

    if probability > 0.65:
        risk = "High Risk"
    elif probability > 0.40:
        risk = "Medium Risk"
    else:
        risk = "Low Risk / Safe"

    return {
        "prediction": prediction,
        "dropout_probability": round(probability * 100, 2),
        "risk_status": risk,
    }