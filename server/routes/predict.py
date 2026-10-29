from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from services.ml_service import get_model
from fastapi import APIRouter, UploadFile, File
import io

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


@router.post("/bulk-predict")
async def bulk_predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "ML Model is not loaded"}
        
    try:
        # 1. Read the uploaded CSV file
        contents = await file.read()
        
        # 2. Convert to Pandas DataFrame
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # We need a list to store results to send back to frontend
        results = []
        
        # Keep essential display columns (Name/ID if they exist)
        display_cols = []
        if 'Student_ID' in df.columns:
            display_cols.append('Student_ID')
        if 'Name' in df.columns:
            display_cols.append('Name')
            
        # 3. Predict for every row
        predictions = model.predict(df)
        probabilities = model.predict_proba(df)[:, 1] # Probability of Dropout (Class 1)
        
        # 4. Format the output
        for i in range(len(df)):
            prob = probabilities[i]
            if prob > 0.65:
                risk = "High Risk"
            elif prob > 0.40:
                risk = "Medium Risk"
            else:
                risk = "Safe"
                
            student_result = {
                "id": df.iloc[i]['Student_ID'] if 'Student_ID' in df.columns else f"Student {i+1}",
                "attendance": float(df.iloc[i]['Attendance_Percentage']),
                "income": str(df.iloc[i]['Family_Income']),
                "prediction": int(predictions[i]),
                "probability": round(prob * 100, 1),
                "risk_status": risk
            }
            results.append(student_result)
            
        return {"status": "success", "total_processed": len(df), "results": results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}