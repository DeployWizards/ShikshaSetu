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

print("Generating high-dimensional synthetic dataset (35 features) for PCA Analysis...")

for i in range(NUM_STUDENTS):
    # ---------------------------------------------------------
    # 1. CORE FEATURES (High Importance for Dropout)
    # ---------------------------------------------------------
    student_id = f"UP12_{10000 + i}"
    city = random.choice(up_cities)
    gender = random.choices(["Male", "Female"], weights=[0.55, 0.45])[0]
    region = random.choices(["Urban", "Rural"], weights=[0.40, 0.60])[0]
    
    siblings = random.choices([0, 1, 2, 3, 4, 5], weights=[0.1, 0.3, 0.3, 0.15, 0.1, 0.05])[0]
    income = random.choices(["< 1 Lakh", "1-3 Lakhs", "3-5 Lakhs", "> 5 Lakhs"], weights=[0.35, 0.40, 0.15, 0.10])[0]
    father_edu = random.choices(["Illiterate", "10th Pass", "12th Pass", "Graduate"], weights=[0.2, 0.4, 0.25, 0.15])[0]
    mother_edu = random.choices(["Illiterate", "10th Pass", "12th Pass", "Graduate"], weights=[0.35, 0.35, 0.2, 0.1])[0]
    internet_access = random.choices(["Yes", "No"], weights=[0.6, 0.4] if region == "Urban" else [0.3, 0.7])[0]
    
    distance_km = round(random.uniform(1, 25), 1)
    stream = random.choices(["Arts", "Science", "Commerce"], weights=[0.5, 0.3, 0.2])[0]
    
    class_10_perc = round(np.clip(np.random.normal(65, 15), 35, 98), 2)
    class_11_perc = round(np.clip(np.random.normal(class_10_perc - 2, 12), 33, 95), 2) 
    attendance_perc = round(np.clip(np.random.normal(70, 15), 25, 100), 2)
    extracurricular = random.choice(["Yes", "No"])
    scholarship = random.choices(["Yes", "No"], weights=[0.2, 0.8])[0]
    transport_availability = random.choices(["Public Bus", "Private Van", "Bicycle", "Walking"], weights=[0.3, 0.2, 0.3, 0.2])[0]
    library_access = random.choice(["Yes", "No"])
    peer_support = random.choices(["High", "Medium", "Low"], weights=[0.3, 0.5, 0.2])[0]
    school_counselling = random.choice(["Yes", "No"])
    
    # Extra generated features to inflate dimensions (Habits & Environment)
    sleep_hours = round(np.clip(np.random.normal(7, 1.5), 4, 10), 1)
    screen_time_hours = round(np.clip(np.random.normal(4, 2), 1, 8), 1)
    water_intake_liters = round(random.uniform(1.0, 4.0), 1)
    daily_commute_mins = round(distance_km * random.uniform(2, 5)) # Tied slightly to distance
    fast_food_frequency = random.choices(["Daily", "Weekly", "Rarely"], weights=[0.2, 0.5, 0.3])[0]
    
    # Social / Psychological / School Environment
    has_best_friend = random.choices(["Yes", "No"], weights=[0.85, 0.15])[0]
    social_media_usage = random.choices(["High", "Moderate", "Low", "None"], weights=[0.4, 0.3, 0.2, 0.1])[0]
    favorite_subject_type = random.choices(["STEM", "Humanities", "Languages"], weights=[0.4, 0.4, 0.2])[0]
    has_pets = random.choice(["Yes", "No"])
    teacher_student_ratio = random.choices(["1:30", "1:40", "1:50", "1:60+"], weights=[0.2, 0.3, 0.3, 0.2])[0]
    classroom_ventilation = random.choices(["Good", "Average", "Poor"], weights=[0.4, 0.4, 0.2])[0]
    playground_size = random.choices(["Large", "Medium", "Small", "None"], weights=[0.2, 0.4, 0.3, 0.1])[0]
    participates_in_festivals = random.choice(["Yes", "No"])
    school_building_quality = random.choices(["New", "Old but Maintained", "Needs Repair"], weights=[0.3, 0.5, 0.2])[0]

    # ---------------------------------------------------------
    # 3. CALCULATING TARGET 
    # ---------------------------------------------------------
    risk_score = 0
    
    # Core logical rules
    if attendance_perc < 60: risk_score += 4
    if income == "< 1 Lakh": risk_score += 3
    if distance_km > 10 and region == "Rural": risk_score += 2
    if siblings >= 3: risk_score += 1.5
    if father_edu == "Illiterate" and mother_edu == "Illiterate": risk_score += 2
    if class_11_perc < 45: risk_score += 2
    if internet_access == "No": risk_score += 1
    if gender == "Female" and distance_km > 12: risk_score += 2 
    
    # Adding a TINY bit of weight to a few new features so correlation isn't exactly 0.00
    if scholarship == "Yes": risk_score -= 0.5
    if school_counselling == "No" and peer_support == "Low": risk_score += 0.5
    
    # Randomness
    risk_score += random.uniform(-2, 2)
    
    # Threshold
    will_dropout = 1 if risk_score >= 7.5 else 0
        
    # Append to data list (All 35 columns)
    data.append([
        student_id, city, gender, region, distance_km, siblings, 
        income, father_edu, mother_edu, internet_access, stream, 
        class_10_perc, class_11_perc, attendance_perc, 
        
        # New attributes
        extracurricular, scholarship, transport_availability, library_access, 
        peer_support, school_counselling, sleep_hours, screen_time_hours, 
        water_intake_liters, daily_commute_mins, fast_food_frequency,
        has_best_friend, social_media_usage, favorite_subject_type, has_pets,
        teacher_student_ratio, classroom_ventilation, playground_size,
        participates_in_festivals, school_building_quality,
        
        will_dropout
    ])

# Create DataFrame
columns = [
    # Original 14
    "Student_ID", "City", "Gender", "Region", "Distance_km", "No_of_Siblings",
    "Family_Income", "Father_Education", "Mother_Education", "Internet_Access",
    "Stream", "Class_10_Percentage", "Class_11_Percentage", "Attendance_Percentage", 
    
    # New 20
    "Extracurricular_Participation", "Scholarship_Received", "Transport_Availability", 
    "Library_Access", "Peer_Academic_Support", "School_Counselling_Access", 
    "Sleep_Hours_Per_Night", "Screen_Time_Hours", "Water_Intake_Liters", 
    "Daily_Commute_Time_Mins", "Fast_Food_Frequency", "Has_Best_Friend", 
    "Social_Media_Usage", "Favorite_Subject_Type", "Has_Pets",
    "Teacher_Student_Ratio", "Classroom_Ventilation", "Playground_Size",
    "Participates_In_Festivals", "School_Building_Quality",
    
    # Target
    "Will_Dropout"
]

df = pd.DataFrame(data, columns=columns)

# Save to CSV
df.to_csv("up_student_dropout_data.csv", index=False)
print("Dataset successfully generated: up_student_dropout_data.csv")
print(f"Total Columns (Features): {len(columns)}")
print(f"Total Students: {len(df)}")
print(f"Dropout Count: {df['Will_Dropout'].sum()} ({round(df['Will_Dropout'].sum()/NUM_STUDENTS*100, 2)}%)")