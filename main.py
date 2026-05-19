from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from fastapi.middleware.cors import CORSMiddleware
import random
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)

texts = [
    "привет",
    "здарова",
    "здравствуйте",
    "добрый день",
    "хай",
    "даров",
    "ку",
    "сколько времени",
    "какая погода",
    "собака",
    "ромашка",
    "машина",
    "танцы",
    "асфальт",
    "123",
    "генератор",
    "номер",
    'добрый папа'
]

labels = [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
]

responses = {
    1: ["Привет!", "Здарова!", "Хай!"],
    0: ["Я не понимаю", "Что?"]
}

class Message(BaseModel):
    text: str

@app.post('/classify')
def classify(message: Message):
    response = int(model.predict(vectorizer.transform([message.text]))[0]) 
    return { 
        'received': random.choice(responses[response])
    }

@app.post('/retrain')
def retrain():
    global model, vectorizer
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4))
    X = vectorizer.fit_transform(texts)
    model = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=1000, verbose=True)
    model.fit(X, labels)
    joblib.dump(model, 'model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')