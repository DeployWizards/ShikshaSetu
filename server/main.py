from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import json

app = FastAPI(title="ShikshaSetu API")

# Allow Frontend to communicate with Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_model', 'dropout_model.pkl')
model = joblib.load(model_path)

# Define Expected Input
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

@app.get("/")
def home():
    return {"message": "ShikshaSetu API is running!"}

@app.post("/predict")
def predict_dropout(data: StudentData):
    student_dict = data.dict()
    df = pd.DataFrame([student_dict])
    
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1] 
    
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






# Add this below your existing /predict route
@app.get("/analytics")
def get_dashboard_analytics():
    try:
        # Load the real dataset
        # Assuming the CSV is inside the ml_model folder (going one step back from server)
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'ml_model', 'up_student_dropout_data.csv')
        df = pd.read_csv(csv_path)

        # 1. KPI Data
        total_students = len(df)
        total_dropouts = int(df['Will_Dropout'].sum())
        dropout_rate = round((total_dropouts / total_students) * 100, 1)

        # 2. District Data (Top 6 cities by total students)
        district_stats = df.groupby('City')['Will_Dropout'].agg(['count', 'sum']).reset_index()
        district_stats.columns = ['city', 'Total', 'Dropout']
        district_stats['Safe'] = district_stats['Total'] - district_stats['Dropout']
        district_stats = district_stats.sort_values(by='Total', ascending=False).head(6)
        district_data = district_stats[['city', 'Safe', 'Dropout']].to_dict(orient='records')

        # 3. Income Data
        income_stats = df.groupby('Family_Income')['Will_Dropout'].agg(['count', 'sum']).reset_index()
        income_stats['DropoutRate'] = round((income_stats['sum'] / income_stats['count']) * 100, 1)
        income_stats.rename(columns={'Family_Income': 'income'}, inplace=True)
        # Custom sort for income levels
        income_order = {'< 1 Lakh': 1, '1-3 Lakhs': 2, '3-5 Lakhs': 3, '> 5 Lakhs': 4}
        income_stats['order'] = income_stats['income'].map(income_order)
        income_stats = income_stats.sort_values('order')
        income_data = income_stats[['income', 'DropoutRate']].to_dict(orient='records')

        # 4. Gender Data
        gender_stats = df.groupby('Gender')['Will_Dropout'].agg(['count', 'sum']).reset_index()
        gender_stats.columns = ['gender', 'Total', 'Dropout']
        gender_stats['Safe'] = gender_stats['Total'] - gender_stats['Dropout']
        gender_data = gender_stats[['gender', 'Safe', 'Dropout']].to_dict(orient='records')

        # 5. Region Data (Rural vs Urban Dropouts)
        # We only want to see the distribution among the DROPOUTS
        dropouts_only = df[df['Will_Dropout'] == 1]
        region_stats = dropouts_only['Region'].value_counts().reset_index()
        region_stats.columns = ['name', 'value']
        # Convert to percentage
        region_stats['value'] = round((region_stats['value'] / total_dropouts) * 100, 1)
        region_data = region_stats.to_dict(orient='records')

        return {
            "kpi": {
                "total_students": total_students,
                "total_dropouts": total_dropouts,
                "dropout_rate": dropout_rate,
                "accuracy": 88.0 # From our SMOTE ML Model
            },
            "charts": {
                "district": district_data,
                "income": income_data,
                "gender": gender_data,
                "region": region_data
            }
        }
    except Exception as e:
        return {"error": str(e)}