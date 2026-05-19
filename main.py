from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from fastapi.middleware.cors import CORSMiddleware
import random
import joblib
from dataset import texts, labels

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)

responses = {
    1: ["Привет!", "Здарова!", "Хай!"],
    0: ["Я не понимаю", "Что?"]
}

class Message(BaseModel):
    text: str

@app.post('/classify')
def classify(message: Message):
    X = vectorizer.transform([message.text])
    response = int(model.predict(X)[0]) 
    proba = max(model.predict_proba(X)[0])
    return { 
        'received': f'{random.choice(responses[response])} ({proba:.2f})'
    }

@app.post('/retrain')
def retrain():
    global model, vectorizer
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))
    X = vectorizer.fit_transform(texts)
    model = MLPClassifier(hidden_layer_sizes=(64), max_iter=1000, verbose=True)
    model.fit(X, labels)
    joblib.dump(model, 'model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')