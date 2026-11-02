from fastapi import APIRouter
from services.data_service import get_dataframe
import pandas as pd
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

# Numeric attributes are grouped into bands before computing dropout rates
NUMERIC_BANDS = {
    'Attendance_Percentage': ([0, 50, 60, 70, 80, 90, 101], ['<50', '50-60', '60-70', '70-80', '80-90', '90+']),
    'Distance_km': ([0, 5, 10, 15, 20, 1000], ['0-5', '5-10', '10-15', '15-20', '20+']),
    'Class_11_Percentage': ([0, 45, 55, 65, 75, 85, 101], ['<45', '45-55', '55-65', '65-75', '75-85', '85+']),
}

def banded(col):
    bins, labels = NUMERIC_BANDS[col]
    return pd.cut(df[col], bins=bins, labels=labels, right=False)

def dropout_rate_by(key, order=None, frame=None):
    # Dropout rate (%) and student count for each group of `key` (a column name or a Series).
    # Defaults to the full dataframe; pass `frame` to scope it to a single city.
    d = df if frame is None else frame
    grp = d.groupby(d[key] if isinstance(key, str) else key, observed=True)['Will_Dropout'].agg(['count', 'mean'])
    if order: grp = grp.reindex(order)
    return [{"group": str(g), "DropoutRate": round(r['mean'] * 100, 1), "Total": int(r['count'])}
            for g, r in grp.iterrows() if not pd.isna(r['count'])]

def banded_frame(frame, col):
    # Same bands as `banded`, but for an arbitrary (city-scoped) frame
    bins, labels = NUMERIC_BANDS[col]
    return pd.cut(frame[col], bins=bins, labels=labels, right=False)

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

    # 5-8. Dropout rate across attendance, distance, Class 11 marks and siblings
    attendance_data = dropout_rate_by(banded('Attendance_Percentage'))
    distance_data = dropout_rate_by(banded('Distance_km'))
    marks_data = dropout_rate_by(banded('Class_11_Percentage'))
    siblings_data = dropout_rate_by('No_of_Siblings')

    # 9. Father vs Mother education, side by side
    edu_order = ['Illiterate', '10th Pass', '12th Pass', 'Graduate']
    father = {d['group']: d['DropoutRate'] for d in dropout_rate_by('Father_Education', edu_order)}
    mother = {d['group']: d['DropoutRate'] for d in dropout_rate_by('Mother_Education', edu_order)}
    parent_edu_data = [{"education": e, "Father": father[e], "Mother": mother[e]} for e in edu_order]

    # 10. Which attributes matter: gap between the highest and lowest group dropout rate
    gap_rows = []
    for col in df.columns.drop(['Student_ID', 'City', 'Will_Dropout']):
        if col in NUMERIC_BANDS:
            rates = df.groupby(banded(col), observed=True)['Will_Dropout'].mean()
        elif df[col].nunique() <= 6:
            rates = df.groupby(col)['Will_Dropout'].mean()
        else:
            continue
        gap_rows.append({"attribute": col.replace('_', ' '), "Gap": round((rates.max() - rates.min()) * 100, 1)})
    gap_data = sorted(gap_rows, key=lambda r: r['Gap'], reverse=True)[:15]

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
            "gender": gender_data,  # NOW IT WILL WORK!
            "attendance": attendance_data,
            "distance": distance_data,
            "marks": marks_data,
            "siblings": siblings_data,
            "parent_education": parent_edu_data,
            "attribute_gap": gap_data
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

    total_students = len(city_df)
    total_dropouts = int(city_df['Will_Dropout'].sum())
    dropout_rate = round((total_dropouts / total_students) * 100, 1)

    # 1. Gender Stats
    gen = city_df.groupby('Gender')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    gen.columns = ['gender', 'Total', 'Dropout']
    gen['Safe'] = gen['Total'] - gen['Dropout']

    # 2. Region Stats (Urban vs Rural)
    reg = city_df.groupby('Region')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    reg.columns = ['region', 'Total', 'Dropout']
    reg['Safe'] = reg['Total'] - reg['Dropout']

    # Region share of dropouts (for the donut) - % of the city's dropouts in each area
    reg_share = city_df[city_df['Will_Dropout'] == 1]['Region'].value_counts().reset_index()
    reg_share.columns = ['name', 'value']
    if total_dropouts > 0:
        reg_share['value'] = round((reg_share['value'] / total_dropouts) * 100, 1)

    # 3. Income Stats (Dropout Rate)
    inc = city_df.groupby('Family_Income')['Will_Dropout'].agg(['count', 'sum']).reset_index()
    inc['DropoutRate'] = round((inc['sum'] / inc['count']) * 100, 1)
    inc.rename(columns={'Family_Income': 'income'}, inplace=True)
    # Sort income levels properly
    income_order = {'< 1 Lakh': 1, '1-3 Lakhs': 2, '3-5 Lakhs': 3, '> 5 Lakhs': 4}
    inc['order'] = inc['income'].map(income_order)
    inc = inc.sort_values('order')

    # 4. Parents' education (Father vs Mother), side by side
    edu_order = ['Illiterate', '10th Pass', '12th Pass', 'Graduate']
    father = {d['group']: d['DropoutRate'] for d in dropout_rate_by('Father_Education', edu_order, frame=city_df)}
    mother = {d['group']: d['DropoutRate'] for d in dropout_rate_by('Mother_Education', edu_order, frame=city_df)}
    parent_edu_data = [{"education": e, "Father": father.get(e, 0), "Mother": mother.get(e, 0)} for e in edu_order]

    # 5-8. Dropout rate across attendance, distance, Class 11 marks and siblings (city-scoped)
    attendance_data = dropout_rate_by(banded_frame(city_df, 'Attendance_Percentage'), frame=city_df)
    distance_data = dropout_rate_by(banded_frame(city_df, 'Distance_km'), frame=city_df)
    marks_data = dropout_rate_by(banded_frame(city_df, 'Class_11_Percentage'), frame=city_df)
    siblings_data = dropout_rate_by('No_of_Siblings', frame=city_df)

    # 9. Which attributes matter most within this city
    gap_rows = []
    for col in city_df.columns.drop(['Student_ID', 'City', 'Will_Dropout']):
        if col in NUMERIC_BANDS:
            rates = city_df.groupby(banded_frame(city_df, col), observed=True)['Will_Dropout'].mean()
        elif city_df[col].nunique() <= 6:
            rates = city_df.groupby(col)['Will_Dropout'].mean()
        else:
            continue
        rates = rates.dropna()
        if len(rates) < 2:
            continue
        gap_rows.append({"attribute": col.replace('_', ' '), "Gap": round((rates.max() - rates.min()) * 100, 1)})
    gap_data = sorted(gap_rows, key=lambda r: r['Gap'], reverse=True)[:15]

    return {
        "overview": {
            "total_students": total_students,
            "total_dropouts": total_dropouts,
            "dropout_rate": dropout_rate
        },
        "charts": {
            "gender": gen[['gender', 'Safe', 'Dropout']].to_dict(orient='records'),
            "region": reg[['region', 'Safe', 'Dropout']].to_dict(orient='records'),
            "region_share": reg_share.to_dict(orient='records'),
            "income": inc[['income', 'DropoutRate']].to_dict(orient='records'),
            "parent_education": parent_edu_data,
            "attendance": attendance_data,
            "distance": distance_data,
            "marks": marks_data,
            "siblings": siblings_data,
            "attribute_gap": gap_data
        }
    }
