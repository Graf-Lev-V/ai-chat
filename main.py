from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

app = FastAPI()

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
    "номер"
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
    0
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

class Message(BaseModel):
    text: str

@app.post('/classify')
def classify(message: Message):
    return { 'received': int(model.predict(vectorizer.transform([message.text]))[0]) }
