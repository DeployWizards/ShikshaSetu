import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib

# ML Metrics & Preprocessing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix, ConfusionMatrixDisplay

# All 6 Algorithms from the PDF
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression, Perceptron
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Imbalanced Learn for SMOTE (Because our real data is imbalanced)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

print("Loading data and setting up preprocessing...")

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

# Drop ID, City, Target AND the Noisy Features
X = df.drop(columns=['Student_ID', 'City', 'Will_Dropout'] + other_features)
y = df['Will_Dropout']


# 2. Setup Columns
categorical_cols = ['Gender', 'Region', 'Family_Income', 'Father_Education', 'Mother_Education', 'Internet_Access', 'Stream']
numerical_cols = ['Distance_km', 'No_of_Siblings', 'Class_10_Percentage', 'Class_11_Percentage', 'Attendance_Percentage']

# 3. Preprocessor (Note: sparse_output=False is required for GaussianNB to work properly)
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
    ])

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 5. Define the 6 Models exactly like the PDF
classifiers = {
    "Gaussian Naive Bayes": GaussianNB(),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, criterion='entropy', random_state=42),
    "Support Vector Classifier": SVC(kernel='linear', probability=True, random_state=42),
    "Perceptron": Perceptron(max_iter=1000, random_state=42),
    "KNN Classifier": KNeighborsClassifier(n_neighbors=5)
}

# Create folder for saving Confusion Matrices
output_dir = "visualizations/model_results"
os.makedirs(output_dir, exist_ok=True)

# Dictionary to store accuracies for the final comparison chart
model_accuracies = {}
best_model_name = ""
best_model_pipeline = None
highest_accuracy = 0

print("\n" + "="*50)
print("TRAINING MODELS & GENERATING CONFUSION MATRICES")
print("="*50)

# 6. Loop through all models, Train, Evaluate, and Plot
for name, clf in classifiers.items():
    print(f"\nTraining {name}...")
    
    # Create Pipeline with SMOTE
    pipeline = ImbPipeline(steps=[
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', clf)
    ])
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Predict
    y_pred = pipeline.predict(X_test)
    
    # Metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    
    model_accuracies[name] = acc
    
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"Accuracy  : {acc:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Track the best model to save for our Backend API
    if acc > highest_accuracy:
        highest_accuracy = acc
        best_model_name = name
        best_model_pipeline = pipeline

    # Plot Confusion Matrix (Like PDF)
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Continue', 'Dropout'])
    disp.plot(cmap='viridis', values_format='d', ax=plt.gca())
    plt.title(f"Confusion Matrix: {name}")
    plt.savefig(f"{output_dir}/{name.replace(' ', '_')}_CM.png")
    plt.close()

# 7. Final Model Comparison Bar Chart (Like Page 33 of PDF)
print("\nGenerating Accuracy Comparison Chart...")
plt.figure(figsize=(10, 6))
# Sort models by accuracy for better visualization
sorted_models = dict(sorted(model_accuracies.items(), key=lambda item: item[1]))
plt.barh(list(sorted_models.keys()), list(sorted_models.values()), color='#1f77b4')
plt.xlabel('Accuracy')
plt.ylabel('Classifiers')
plt.title('Comparison of Machine Learning Models')
plt.xlim(0, 1.0) # Accuracy ranges from 0 to 1
for index, value in enumerate(sorted_models.values()):
    plt.text(value - 0.05, index, f"{value:.2f}", color='white', va='center', fontweight='bold')
plt.tight_layout()
plt.savefig(f"{output_dir}/Final_Model_Comparison.png")
plt.close()

# 8. Save the absolute best model for FastAPI
# Note: We save it one folder up (in server directory) so the backend can use it directly!
try:
    joblib.dump(best_model_pipeline, '../server/dropout_model.pkl')
    print(f"\nSaved Best Model ({best_model_name}) to server folder successfully!")
except:
    joblib.dump(best_model_pipeline, 'dropout_model.pkl')
    print(f"\nSaved Best Model ({best_model_name}) locally.")

print(f"\nProcess Complete! Check 'ml_model/{output_dir}' for your graphs.")