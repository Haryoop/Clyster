import pprint
import os
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional
from bson.objectid import ObjectId
from dotenv import load_dotenv, find_dotenv
from google import genai
from models.user import user_collection
import re

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

def generate_questions(user_id: str):
    """Generate interview questions based on the user's métier and store them as a form.
    
    Args:
        user_id: The ID of the user whose métier will be used to generate questions.
    
    Returns:
        The created form document (with form_id, user_id, metier, and questions)
        or None if an error occurred.
    """
    try:
        # Convert string ID to ObjectId
        _id = ObjectId(user_id)
        
        # Find the user by ID
        user = user_collection.find_one({"_id": _id})
        
        if not user:
            print(f"No user found with ID {user_id}")
            return None
            
        # Get the métier from the user document
        metier = user.get("métier")
        
        if not metier:
            print(f"No métier found for user with ID {user_id}")
            return None
            
        print(f"Generating questions for métier: {metier}")
        
        # Initialize the Gemini client and generate questions
        client = genai.Client(api_key=api)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Génère 5 questions d'entretien directes pour un(e) {metier}. Ne mets aucun texte d'introduction, juste les questions, une par ligne."
        )
        
        # Process the response - split by lines and clean
        raw_questions = response.text.split('\n')
        questions = []
        
        for q in raw_questions:
            q = q.strip()
            # Skip empty lines and lines that look like headers
            if q and not q.lower().startswith(("voici", "here are", "questions pour")):
                # Remove any numbering or bullets at the start
                q = re.sub(r'^(\d+\.\s*|-\s*|\*\s*)', '', q)
                questions.append(q)
        
        questions = questions[:5]
        
        questions.extend([""] * (5 - len(questions)))
        
        form_document = {
            "candidat_id": _id,
            #"entreprise_id":"",
            "metier": metier,
            "question1": questions[0],
            "question2": questions[1],
            "question3": questions[2],
            "question4": questions[3],
            "question5": questions[4],
            "reponse1": "",
            "reponse2": "",
            "reponse3": "",
            "reponse4": "",
            "reponse5": "",
        }
        
        result = form_collection.insert_one(form_document)
        print(f"Created form with ID: {result.inserted_id}")
        
        return {
            "form_id": str(result.inserted_id),
            "user_id": user_id,
            "metier": metier,
            "questions": questions
        }
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        return None
    
def check_form_exists(user_id: str):
    """Check if a form exists for the given user ID.
    
    Args:
        user_id: The ID of the user to check
        
    Returns:
        dict: {'exists': bool} indicating if form exists
    """
    try:
        _id = ObjectId(user_id)
        # Changed from user_id to candidat_id to match your database schema
        form = form_collection.find_one({"candidat_id": _id})
        return {"exists": form is not None}
    except Exception as e:
        print(f"Error checking form existence: {e}")
        return {"exists": False}