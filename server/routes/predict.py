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
    
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1] 
    
    if probability > 0.65:
        risk = "High Risk"
    elif probability > 0.40:
        risk = "Medium Risk"
    else:
        risk = "Low Risk / Safe"

    return {
        "prediction": int(prediction),
        "dropout_probability": round(probability * 100, 2),
        "risk_status": risk,
    }
