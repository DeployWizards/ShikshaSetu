import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
import os

print("Starting Exploratory Data Analysis (EDA)...")

# 1. Load Data
df = pd.read_csv("up_student_dropout_data.csv")

# Create a folder to save graphs if it doesn't exist
output_dir = "visualizations"
os.makedirs(output_dir, exist_ok=True)

# 2. Target Variable Pie Chart (Like Page 9 of PDF)
plt.figure(figsize=(8, 8))
plt.title("Student Dropout Status Distribution")
dropout_counts = df['Will_Dropout'].value_counts()
plt.pie(dropout_counts, labels=['Continue (0)', 'Dropout (1)'], autopct='%1.2f%%', 
        explode=(0, 0.1), colors=['#10B981', '#EF4444'], shadow=True)
plt.savefig(f"{output_dir}/1_target_distribution.png")
plt.close()
print("- Saved Target Distribution Pie Chart")

# 3. Countplot: Dropout by Gender (Like Page 10 of PDF)
plt.figure(figsize=(8, 6))
sns.countplot(data=df, x='Will_Dropout', hue='Gender', palette='Set2')
plt.title("Dropout Count by Gender")
plt.xlabel("0 = Continue, 1 = Dropout")
plt.savefig(f"{output_dir}/2_gender_vs_dropout.png")
plt.close()
print("- Saved Gender vs Dropout Countplot")

# 4. Distribution Plot of Attendance (Like Page 7/8 of PDF)
plt.figure(figsize=(10, 5))
sns.histplot(df[df['Will_Dropout'] == 1]['Attendance_Percentage'], color="red", label="Dropout", kde=True, stat="density", linewidth=0)
sns.histplot(df[df['Will_Dropout'] == 0]['Attendance_Percentage'], color="green", label="Continue", kde=True, stat="density", linewidth=0)
plt.title("Density Distribution of Attendance Percentage")
plt.legend()
plt.savefig(f"{output_dir}/3_attendance_distribution.png")
plt.close()
print("- Saved Attendance Distribution Plot")

# 5. Correlation Heatmap (Like Page 19 of PDF)
# To find correlation, we must convert categorical strings to numbers temporarily
df_encoded = df.copy()
le = LabelEncoder()
categorical_cols = df_encoded.select_dtypes(include=['object']).columns

for col in categorical_cols:
    df_encoded[col] = le.fit_transform(df_encoded[col])

plt.figure(figsize=(12, 10))
corr_matrix = df_encoded.corr(method="pearson")
# Dropping Student_ID from heatmap as it's useless
corr_matrix = corr_matrix.drop(index='Student_ID', columns='Student_ID', errors='ignore')

sns.heatmap(corr_matrix, annot=False, cmap="YlGnBu", fmt='.2f', vmin=-1, vmax=1)
plt.title("Pearson Correlation Heatmap")
plt.tight_layout()
plt.savefig(f"{output_dir}/4_correlation_heatmap.png")
plt.close()
print("- Saved Correlation Heatmap")

print(f"\nEDA Complete! Check the '{output_dir}' folder inside ml_model for your graphs.")