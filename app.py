from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

class TextInput(BaseModel):
    text: str

app = FastAPI(title="SentiSphere API")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pretrained pipelines for sentiment, emotion, and toxicity detection
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
emotion_analyzer = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)
toxicity_analyzer = pipeline("text-classification", model="unitary/toxic-bert", return_all_scores=True)

@app.post("/predict/sentiment")
async def predict_sentiment(input: TextInput):
    try:
        result = sentiment_analyzer(input.text)
        return {"sentiment": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/emotion")
async def predict_emotion(input: TextInput):
    try:
        result = emotion_analyzer(input.text)
        return {"emotion": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/toxicity")
async def predict_toxicity(input: TextInput):
    try:
        result = toxicity_analyzer(input.text)
        return {"toxicity": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
