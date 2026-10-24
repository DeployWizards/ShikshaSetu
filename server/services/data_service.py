
import pandas as pd
import os

# Load the dataset once in memory
csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_model', 'up_student_dropout_data.csv')

try:
    df = pd.read_csv(csv_path)
    print("Dataset loaded successfully.")
except Exception as e:
    print(f"Error loading dataset: {e}")
    df = pd.DataFrame() # Fallback empty dataframe

def get_dataframe():
    return df