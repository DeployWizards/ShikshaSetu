import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
import os

# Load Dataset
df = pd.read_csv("up_student_dropout_data.csv")
X = df.drop(columns=['Student_ID', 'City', 'Will_Dropout'])
y = df['Will_Dropout']
feature_names = X.columns.tolist()

# Encode Categorical Variables
X_encoded = X.copy()
le = LabelEncoder()
for col in X_encoded.select_dtypes(include=['object']).columns:
    X_encoded[col] = le.fit_transform(X_encoded[col])

# Scale Features
scaler = StandardScaler()
X_processed = scaler.fit_transform(X_encoded)

output_dir = "visualizations"
os.makedirs(output_dir, exist_ok=True)

# ---------------------------------------------------------
# Dimensionality Reduction (PCA)
# ---------------------------------------------------------
pca = PCA()
pca.fit(X_processed)

# Cumulative share of variance explained by the first k components
components = len(feature_names)
x_ax = np.arange(1, components + 1)

cumulative_variance = np.cumsum(pca.explained_variance_ratio_)
k90 = int(np.argmax(cumulative_variance >= 0.90)) + 1
print(f"PCA: {k90} of {components} components needed for 90% of the variance")

plt.figure(figsize=(10, 6))
plt.plot(x_ax, cumulative_variance, marker='o', linestyle='-', color='#2563EB', linewidth=2, markersize=6)
plt.axhline(y=0.90, color='#EF4444', linestyle='--', linewidth=2)

plt.text(1, 0.92, f'90% Variance Threshold (Component {k90} of {components})', color='#DC2626', fontsize=12, fontweight='bold')
plt.axvline(x=k90, color='gray', linestyle=':', ymax=0.90)

plt.fill_between(x_ax, cumulative_variance, alpha=0.1, color='#3B82F6')
plt.title('PCA: Cumulative Explained Variance', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Number of Principal Components', fontsize=11)
plt.ylabel('Cumulative Explained Variance', fontsize=11)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(f"{output_dir}/5_pca_variance_plot.png", dpi=300)
plt.close()

# ---------------------------------------------------------
# Feature Importance Analysis
# ---------------------------------------------------------
rf = RandomForestClassifier(n_estimators=200, max_depth=5, min_samples_split=20, random_state=42)
rf.fit(X_processed, y)

# Mean decrease in impurity, as computed by the Random Forest (sums to 1)
importances = rf.feature_importances_

indices = np.argsort(importances)[::-1]

top_n = 20
top_features = [feature_names[i] for i in indices[:top_n]]
top_importances = [importances[i] for i in indices[:top_n]]

formatted_features = [f.replace('_', ' ') for f in top_features]

plt.figure(figsize=(12, 9))
ax = sns.barplot(x=top_importances, y=formatted_features, palette="viridis")

plt.title('Random Forest Feature Importance Analysis', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Relative Importance (Mean Decrease in Impurity)', fontsize=11)
plt.ylabel('Student Attributes', fontsize=11)

for p in ax.patches:
    width = p.get_width()
    plt.text(width + 0.002, p.get_y() + p.get_height()/2. + 0.1, f'{width:.3f}', ha="left", fontsize=9)

plt.grid(axis='x', alpha=0.3)
plt.tight_layout()
plt.savefig(f"{output_dir}/6_feature_importance.png", dpi=300)
plt.close()