import pprint
import os
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
from bson.objectid import ObjectId
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
api=os.environ.get("GEMINI_API_KEY")

client = MongoClient(connection_string)
Clyster = client.Clyster
form_collection = Clyster.form
printer = pprint.PrettyPrinter()

class Form(BaseModel):
    question1: str
    reponse1: str
    question2: str
    reponse2: str
    question3: str
    reponse3: str

def add_form(question1: str, reponse1: str, question2: str, reponse2: str, question3: str, reponse3: str) -> str:
    form_document = {
        "question1": question1,
        "reponse1": reponse1,
        "question2": question2,
        "reponse2": reponse2,
        "question3": question3,
        "reponse3": reponse3,
    }
    result = form_collection.insert_one(form_document)
    print(f"Inserted form with ID: {result.inserted_id}")
    return str(result.inserted_id)

#def generate_questions(job: str) -> list:
#   return
from google import genai

def generate_questions(metier: str):
    client = genai.Client(api_key=api)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Génère 5 questions d'entretien directes pour un(e) {metier}."
    )
    questions = response.text.split('\n')
    questions = [q.strip() for q in questions if q.strip()]
    questions = questions[1:6]
    if questions[0] == '':
        questions = questions[1:]
    for i, question in enumerate(questions):
        print(question)
    #xreate
    return questions


