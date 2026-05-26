from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from fastapi.middleware.cors import CORSMiddleware
import random
import joblib
import os
import json
from contextlib import asynccontextmanager
from sklearn.model_selection import train_test_split

def training(app: FastAPI):
    with open('dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    all_texts = []
    all_labels = []
    for key, texts in data.items():
        for text in texts:
            all_texts.append(text)
            all_labels.append(int(key))
    texts_train, texts_test, labels_train, labels_test = train_test_split(all_texts, all_labels, test_size=0.2, random_state=42)
    app.state.vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 5))
    X = app.state.vectorizer.fit_transform(texts_train)
    app.state.model = MLPClassifier(hidden_layer_sizes=(64,), max_iter=1000, verbose=True)
    app.state.model.fit(X, labels_train)
    joblib.dump(app.state.model, 'model.pkl')
    joblib.dump(app.state.vectorizer, 'vectorizer.pkl')
    joblib.dump(texts_test, 'texts_test.pkl')
    joblib.dump(labels_test, 'labels_test.pkl')

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.path.exists('model.pkl') and os.path.exists('vectorizer.pkl'):
        app.state.model = joblib.load('model.pkl')
        app.state.vectorizer = joblib.load('vectorizer.pkl')
    else:
        training(app)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')],
    allow_methods=['*'],
    allow_headers=['*']
)

classes = {
    1: "Приветствие",
    2: "Прощание",
    3: "Благодарность",
    4: "Вопрос",
    0: 'Без категории'
}

responses = {
    1: ["Привет!", "Здарова!", "Хай!"],
    2: ["Пока!", "До свидания!", "Удачи!"],
    3: ["Пожалуйста!", "Не за что!", "Всегда рад!"],
    4: ["Хороший вопрос!", "Не знаю", "Затрудняюсь ответить"],
    0: ["Я не понимаю", "Что?"]
}

class Message(BaseModel):
    text: str

@app.post('/classify')
def classify(message: Message):
    X = app.state.vectorizer.transform([message.text])
    response = int(app.state.model.predict(X)[0]) 
    proba = max(app.state.model.predict_proba(X)[0])
    return { 
        'text': random.choice(responses[response]),
        'proba': round(proba, 2),
        'class': classes[response]
    }

@app.post('/training')
def training_handler():
    training(app)
    return {'status': 'Training started'}

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
    for key in data: 
        if add.text in data[key]:
            return {'error': 'Text already exists'}
    if str(add.label) not in data:
        return {'error': 'Invalid label'}
    data[str(add.label)].append(add.text)
    with open('dataset.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return {'status': 'ok'}

@app.get('/stats')
def stats():
    with open('dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    counts = {}
    for key in data:
        counts[key] = len(data[key])
    texts_test = joblib.load('texts_test.pkl')
    labels_test = joblib.load('labels_test.pkl')
    X = app.state.vectorizer.transform(texts_test)
    return {
        'counts': counts,
        'accuracy': round(app.state.model.score(X, labels_test) * 100, 1)
    }

