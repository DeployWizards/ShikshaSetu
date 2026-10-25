import joblib
import os

# Load the model once when the server starts
model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_model', 'dropout_model.pkl')
try:
    model = joblib.load(model_path)
    print("ML Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def get_model():
    return model