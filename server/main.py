from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes import predict, analytics

app = FastAPI(title="ShikshaSetu Enterprise API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register Routers
viz_path = os.path.join(os.path.dirname(__file__), '..', 'ml_model', 'visualizations')
app.mount("/static", StaticFiles(directory=viz_path), name="static")
# -----------------------------------------------------------------------------

# Register Routers
app.include_router(predict.router, tags=["Prediction endpoints"])
app.include_router(analytics.router, tags=["Analytics endpoints"])

@app.get("/")
def home():
    return {"message": "ShikshaSetu Modular API is running perfectly!"}