from fastapi import APIRouter
from services.data_service import get_dataframe
import json
import os

router = APIRouter()
df = get_dataframe()

# Written by ml_model/train_multiple_models.py after each training run
metrics_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_model', 'model_metrics.json')

def get_model_accuracy():
    try:
        with open(metrics_path) as f:
            return json.load(f)["accuracy"]
    except (OSError, KeyError, ValueError):
        return None

@router.get("/analytics")
def get_dashboard_analytics():
    if df.empty: return {"error": "Data not found"}
    
    total_students = len(df)
    total_dropouts = int(df['Will_Dropout'].sum())
    
    # 1. District Stats
    dist = df.groupby('City')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    dist.columns = ['city', 'Total', 'Dropout']
    dist['Safe'] = dist['Total'] - dist['Dropout']
    district_data = dist.sort_values(by='Total', ascending=False).head(6)[['city', 'Safe', 'Dropout']].to_dict(orient='records')
    
    # 2. Income Stats
    inc = df.groupby('Family_Income')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    inc['DropoutRate'] = round((inc['sum'] / inc['count']) * 100, 1)
    inc.rename(columns={'Family_Income': 'income'}, inplace=True)
    income_order = {'< 1 Lakh': 1, '1-3 Lakhs': 2, '3-5 Lakhs': 3, '> 5 Lakhs': 4}
    inc['order'] = inc['income'].map(income_order)
    inc = inc.sort_values('order')
    income_data = inc[['income', 'DropoutRate']].to_dict(orient='records')
    
    # 3. Region Stats
    reg = df[df['Will_Dropout'] == 1]['Region'].value_counts().reset_index()
    reg.columns = ['name', 'value']
    reg['value'] = round((reg['value'] / total_dropouts) * 100, 1)
    
    # 4. Gender Stats (THIS WAS MISSING!)
    gen = df.groupby('Gender')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    gen.columns = ['gender', 'Total', 'Dropout']
    gen['Safe'] = gen['Total'] - gen['Dropout']
    gender_data = gen[['gender', 'Safe', 'Dropout']].to_dict(orient='records')

    return {
        "kpi": {
            "total_students": total_students,
            "total_dropouts": total_dropouts,
            "dropout_rate": round((total_dropouts / total_students) * 100, 1),
            "accuracy": get_model_accuracy()
        },
        "charts": {
            "district": district_data,
            "income": income_data,
            "region": reg.to_dict(orient='records'),
            "gender": gender_data  # NOW IT WILL WORK!
        }
    }


@router.get("/cities")
def get_cities_list():
    if df.empty: return {"error": "Data not found"}
    return {"cities": sorted(df['City'].unique().tolist())}

@router.get("/city-analytics/{city_name}")
def get_city_analytics(city_name: str):
    if df.empty: return {"error": "Data not found"}
    
    city_df = df[df['City'] == city_name]
    if city_df.empty: return {"error": "City not found"}

    # 1. Gender Stats
    gen = city_df.groupby('Gender')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    gen.columns = ['gender', 'Total', 'Dropout']
    gen['Safe'] = gen['Total'] - gen['Dropout']
    
    # 2. Region Stats (Urban vs Rural)
    reg = city_df.groupby('Region')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    reg.columns = ['region', 'Total', 'Dropout']
    reg['Safe'] = reg['Total'] - reg['Dropout']

    # 3. Income Stats (Dropout Rate)
    inc = city_df.groupby('Family_Income')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    inc['DropoutRate'] = round((inc['sum'] / inc['count']) * 100, 1)
    inc.rename(columns={'Family_Income': 'income'}, inplace=True)
    # Sort income levels properly
    income_order = {'< 1 Lakh': 1, '1-3 Lakhs': 2, '3-5 Lakhs': 3, '> 5 Lakhs': 4}
    inc['order'] = inc['income'].map(income_order)
    inc = inc.sort_values('order')

    # 4. Father's Education Stats (Dropout Rate)
    edu = city_df.groupby('Father_Education')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    edu['DropoutRate'] = round((edu['sum'] / edu['count']) * 100, 1)
    edu.rename(columns={'Father_Education': 'education'}, inplace=True)
    
    return {
        "overview": {
            "total_students": len(city_df),
            "total_dropouts": int(city_df['Will_Dropout'].sum())
        },
        "charts": {
            "gender": gen[['gender', 'Safe', 'Dropout']].to_dict(orient='records'),
            "region": reg[['region', 'Safe', 'Dropout']].to_dict(orient='records'),
            "income": inc[['income', 'DropoutRate']].to_dict(orient='records'),
            "education": edu[['education', 'DropoutRate']].to_dict(orient='records')
        }
    }
