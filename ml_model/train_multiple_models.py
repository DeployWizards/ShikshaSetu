import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
import joblib
import json

# Import Models
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier

# Import SMOTE and Imblearn Pipeline
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

print("Loading dataset...")
# 1. Load Data
df = pd.read_csv("up_student_dropout_data.csv")

other_features = [
    "Extracurricular_Participation", "Scholarship_Received", "Transport_Availability", 
    "Library_Access", "Peer_Academic_Support", "School_Counselling_Access", 
    "Sleep_Hours_Per_Night", "Screen_Time_Hours", "Water_Intake_Liters", 
    "Daily_Commute_Time_Mins", "Fast_Food_Frequency", "Has_Best_Friend", 
    "Social_Media_Usage", "Favorite_Subject_Type", "Has_Pets",
    "Teacher_Student_Ratio", "Classroom_Ventilation", "Playground_Size",
    "Participates_In_Festivals", "School_Building_Quality"
]

X = df.drop(columns=['Student_ID', 'City', 'Will_Dropout'] + other_features)
y = df['Will_Dropout']

# 3. Define Categorical and Numerical columns
categorical_cols = ['Gender', 'Region', 'Family_Income', 'Father_Education', 
                    'Mother_Education', 'Internet_Access', 'Stream']
numerical_cols = ['Distance_km', 'No_of_Siblings', 'Class_10_Percentage', 
                  'Class_11_Percentage', 'Attendance_Percentage']

# 4. Create Preprocessing Configuration
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

# 5. Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 6. Define the Dictionary of Optimized Base Classifiers (Removed Decision Tree)
classifiers = {
    "Logistic Regression": LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, random_state=42)
}

print("\n--- INDIVIDUAL MODEL EVALUATION (WITH SMOTE) ---")
estimators_for_voting = []

for name, clf in classifiers.items():
    pipeline = ImbPipeline(steps=[
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', clf)
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    print(f"\n{name}:")
    print(f"  Precision: {precision_score(y_test, y_pred):.4f} | Recall: {recall_score(y_test, y_pred):.4f} | F1-Score: {f1_score(y_test, y_pred):.4f}")
    
    estimators_for_voting.append((name, clf))

# 7. Create the Master Ensemble Model with Custom Weights
print("\n--- TRAINING MASTER ENSEMBLE (WEIGHTED VOTING CLASSIFIER) ---")
# Giving highest weight (3) to Gradient Boosting, medium (2) to RF, low (1) to LR
voting_clf = VotingClassifier(estimators=estimators_for_voting, voting='soft', weights=[1, 2, 3])

master_pipeline = ImbPipeline(steps=[
    ('preprocessor', preprocessor),
    ('smote', SMOTE(random_state=42)),
    ('classifier', voting_clf)
])

master_pipeline.fit(X_train, y_train)

# 8. Evaluate with Standard and Custom Probability Thresholds
print("\n--- FINAL MASTER MODEL EVALUATION ---")

# Default Threshold (0.5)
y_pred_default = master_pipeline.predict(X_test)
print("\nClassification Report (Default Threshold 0.5):")
print(classification_report(y_test, y_pred_default))

# Custom Threshold (0.4) to catch more potential dropouts
custom_threshold = 0.4
y_probs = master_pipeline.predict_proba(X_test)[:, 1] # Get probabilities for Class 1
y_pred_custom = (y_probs >= custom_threshold).astype(int)

print(f"\nClassification Report (Custom Threshold {custom_threshold}):")
print(classification_report(y_test, y_pred_custom))


# 9. Save test-set metrics (default threshold 0.5) for the dashboard
metrics = {
    "accuracy": round(accuracy_score(y_test, y_pred_default) * 100, 1),
    "precision": round(precision_score(y_test, y_pred_default) * 100, 1),
    "recall": round(recall_score(y_test, y_pred_default) * 100, 1),
    "f1": round(f1_score(y_test, y_pred_default) * 100, 1),
}
with open('model_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)
print(f"\nTest metrics saved to 'model_metrics.json': {metrics}")

# 10. Save the model where the server loads it (server/services/ml_service.py)
joblib.dump(master_pipeline, 'dropout_model.pkl')
print("Optimized Master Ensemble Model saved to 'ml_model/dropout_model.pkl'")
