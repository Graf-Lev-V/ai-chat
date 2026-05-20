from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from fastapi.middleware.cors import CORSMiddleware
import random
import joblib
import os
import json

app = FastAPI()

def training():
    with open('dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    greetings = data['1']
    unknown = data['0']
    labels = [1] * len(greetings) + [0] * len(unknown)
    global model, vectorizer
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 5))
    X = vectorizer.fit_transform(greetings + unknown)
    model = MLPClassifier(hidden_layer_sizes=(64,), max_iter=1000, verbose=True)
    model.fit(X, labels)
    joblib.dump(model, 'model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')

def init_model():
    global model, vectorizer
    if os.path.exists('model.pkl') and os.path.exists('vectorizer.pkl'):
        model = joblib.load('model.pkl')
        vectorizer = joblib.load('vectorizer.pkl')
    else:
        training()

init_model()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)

classes = {
    1: "Приветствие",
    0: 'Без категории'
}

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

@app.post('/training')
def training_handler():
    training()
    return

@app.get('/classes')
def get_classes():
    return classes

class Add(BaseModel):
    text: str
    label: int

@app.post('/add')
def add(add: Add):
    with open('dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    data[str(add.label)].append(add.text)
    with open('dataset.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    training()
    return
