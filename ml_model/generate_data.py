import pandas as pd
import numpy as np
import random

# Number of students
NUM_STUDENTS = 5000

# UP Cities list
up_cities = [
    "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", 
    "Meerut", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad", 
    "Gorakhpur", "Jhansi", "Noida", "Mathura", "Ayodhya"
]

data = []

for i in range(NUM_STUDENTS):
    # Basic Info
    student_id = f"UP12_{10000 + i}"
    city = random.choice(up_cities)
    gender = random.choices(["Male", "Female"], weights=[0.55, 0.45])[0]
    region = random.choices(["Urban", "Rural"], weights=[0.40, 0.60])[0]
    
    # Family Background
    siblings = random.choices([0, 1, 2, 3, 4, 5], weights=[0.1, 0.3, 0.3, 0.15, 0.1, 0.05])[0]
    income = random.choices(["< 1 Lakh", "1-3 Lakhs", "3-5 Lakhs", "> 5 Lakhs"], weights=[0.35, 0.40, 0.15, 0.10])[0]
    father_edu = random.choices(["Illiterate", "10th Pass", "12th Pass", "Graduate"], weights=[0.2, 0.4, 0.25, 0.15])[0]
    mother_edu = random.choices(["Illiterate", "10th Pass", "12th Pass", "Graduate"], weights=[0.35, 0.35, 0.2, 0.1])[0]
    internet_access = random.choices(["Yes", "No"], weights=[0.6, 0.4] if region == "Urban" else [0.3, 0.7])[0]
    
    # School Info
    distance_km = round(random.uniform(1, 25), 1)
    stream = random.choices(["Arts", "Science", "Commerce"], weights=[0.5, 0.3, 0.2])[0]
    
    # Academic Performance (Normal Distribution to make it realistic)
    class_10_perc = round(np.clip(np.random.normal(65, 15), 35, 98), 2)
    class_11_perc = round(np.clip(np.random.normal(class_10_perc - 2, 12), 33, 95), 2) # slightly lower than 10th
    attendance_perc = round(np.clip(np.random.normal(70, 15), 25, 100), 2)
    
    # ---------------------------------------------------------
    # MAGIC HAPPENS HERE: Calculating Dropout Probability (Logic)
    # ---------------------------------------------------------
    risk_score = 0
    
    if attendance_perc < 60: risk_score += 4
    if income == "< 1 Lakh": risk_score += 3
    if distance_km > 10 and region == "Rural": risk_score += 2
    if siblings >= 3: risk_score += 1.5
    if father_edu == "Illiterate" and mother_edu == "Illiterate": risk_score += 2
    if class_11_perc < 45: risk_score += 2
    if internet_access == "No": risk_score += 1
    if gender == "Female" and distance_km > 12: risk_score += 2 # Social factor in remote areas
    
    # Adding some randomness so the ML model doesn't get a 100% perfect math formula
    risk_score += random.uniform(-2, 2)
    
    # Threshold for dropout
    # If score > 7, high chance of dropout
    if risk_score >= 7.5:
        will_dropout = 1
    else:
        will_dropout = 0
        
    # Append to data list
    data.append([
        student_id, city, gender, region, distance_km, siblings, 
        income, father_edu, mother_edu, internet_access, stream, 
        class_10_perc, class_11_perc, attendance_perc, will_dropout
    ])

# Create DataFrame
columns = [
    "Student_ID", "City", "Gender", "Region", "Distance_km", "No_of_Siblings",
    "Family_Income", "Father_Education", "Mother_Education", "Internet_Access",
    "Stream", "Class_10_Percentage", "Class_11_Percentage", "Attendance_Percentage", "Will_Dropout"
]

df = pd.DataFrame(data, columns=columns)

# Save to CSV
df.to_csv("up_student_dropout_data.csv", index=False)
print("Dataset successfully generated: up_student_dropout_data.csv")
print(f"Total Students: {len(df)}")
print(f"Dropout Count: {df['Will_Dropout'].sum()} ({round(df['Will_Dropout'].sum()/NUM_STUDENTS*100, 2)}%)")