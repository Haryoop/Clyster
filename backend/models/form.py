import pprint
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
from bson.objectid import ObjectId



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

