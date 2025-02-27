import pprint
from datetime import date
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional
from bson.objectid import ObjectId
import bcrypt

client = MongoClient(connection_string)
Clyster = client.Clyster
user_collection = Clyster.user
printer = pprint.PrettyPrinter()

class Type(Enum):
    CANDIDAT = "candidat"
    ENTREPRISE = "entreprise"

class Secteur(Enum):
    INFORMATIQUE = "informatique"
    SANTE = "santé"
    ASSURANCE = "assurance"

class Metier(Enum):
    DEVELOPPEUR = "développeur"
    RH = "responsable RH"
    MARKETING = "marketing"
    VENTE = "vente"

class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    birthdate: date
    type: Type
    métier: Metier

class Company(BaseModel):
    company_name: str
    email: str
    password: str
    type: Type
    secteur: Secteur

# Methods
def find_all_users() -> List[dict]:
    return list(user_collection.find())

def add_user(first_name: str, last_name: str, email: str, password: str, birthdate: date, métier: Metier) -> str:
    if not isinstance(métier, Metier):
        raise ValueError("Invalid métier. It must be an instance of Metier enum.")
    user_document = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,
        "birthdate": birthdate.isoformat(),
        "type": Type.CANDIDAT.value,
        "métier": métier.value
    }
    result = user_collection.insert_one(user_document)
    print(f"Inserted user with ID: {result.inserted_id}")
    return str(result.inserted_id)

def add_company(company_name: str, email: str, password: str, secteur: Secteur) -> str:
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    company_document = {
        "company_name": company_name,
        "email": email,
        "password": hashed_password.decode('utf-8'),
        "type": Type.ENTREPRISE.value,
        "secteur": secteur.value
    }
    
    result = user_collection.insert_one(company_document)
    print(f"Inserted company with ID: {result.inserted_id}")
    return str(result.inserted_id)


def login(email: str, password: str) -> bool:
    """Authenticate a user by verifying email and password."""
    user = user_collection.find_one({"email": email})

    if user is None:
        print(f"User with email {email} not found in the database.")
        return False 
    print(f"User found: {user}") 

    hashed_password = user["password"].encode('utf-8')
    password = password.encode('utf-8') 
    if bcrypt.checkpw(password, hashed_password): 
        print("Login successful.")
        return True
    else:
        print("Incorrect password.")
        return False

def update_user(user_id: str, updates: dict) -> bool:
    """Update an existing user by their ID."""
    try:
        _id = ObjectId(user_id)

        user = user_collection.find_one({"_id": _id, "type": Type.CANDIDAT.value})
        if not user:
            print(f"No user found with ID {user_id}.")
            return False

        if "métier" in updates and updates["métier"] not in [m.value for m in Metier]:
            print("Invalid métier value.")
            return False
        
        if "birthdate" in updates:
            try:
                updates["birthdate"] = date.fromisoformat(updates["birthdate"]).isoformat()
            except ValueError:
                print("Invalid birthdate format. Use YYYY-MM-DD.")
                return False

        if "password" in updates:
            updates["password"] = bcrypt.hashpw(updates["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        result = user_collection.update_one({"_id": _id}, {"$set": updates})

        if result.modified_count > 0:
            print(f"User with ID {user_id} updated successfully.")
            return True
        else:
            print(f"No changes made to user with ID {user_id}.")
            return False

    except Exception as e:
        print(f"Error updating user: {e}")
        return False


def update_company(company_id: str, updates: dict) -> bool:
    """Update an existing company by their ID."""
    try:
        _id = ObjectId(company_id)
        company = user_collection.find_one({"_id": _id, "type": Type.ENTREPRISE.value})
        if not company:
            print(f"No company found with ID {company_id}.")
            return False

        if "secteur" in updates and updates["secteur"] not in [s.value for s in Secteur]:
            print("Invalid secteur value.")
            return False

        if "password" in updates:
            updates["password"] = bcrypt.hashpw(updates["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        result = user_collection.update_one({"_id": _id}, {"$set": updates})

        if result.modified_count > 0:
            print(f"Company with ID {company_id} updated successfully.")
            return True
        else:
            print(f"No changes made to company with ID {company_id}.")
            return False

    except Exception as e:
        print(f"Error updating company: {e}")
        return False


def get_user_by_first_name(first_name: str) -> Optional[dict]:
    """Retrieve a user by their first name."""
    user = user_collection.find_one({"first_name": first_name})
    printer.pprint(user)
    return user

def count_all_users() -> int:
    """Count all users in the collection."""
    count = user_collection.count_documents({})
    print('Number of users:', count)
    return count

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Retrieve a user by their ID."""
    _id = ObjectId(user_id)
    user = user_collection.find_one({"_id": _id})
    printer.pprint(user)
    return user

def delete_user(user_id: str) -> bool:
    """Delete a user by their ID."""
    try:
        _id = ObjectId(user_id)
        result = user_collection.delete_one({"_id": _id})
        if result.deleted_count > 0:
            print(f"User with ID {user_id} deleted successfully.")
            return True
        else:
            print(f"No user found with ID {user_id}.")
            return False
    except Exception as e:
        print(f"Error occurred: {e}")
        return False