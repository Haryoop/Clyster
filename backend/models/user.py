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

# Enums
class Type(Enum):
    EMPLOYE = "employé"
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

# Pydantic Models (Optional)
class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
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
    """Retrieve all users from the collection."""
    return list(user_collection.find())

def add_user(first_name: str, last_name: str, email: str, password: str, métier: Metier) -> str:
    """Add a new user to the collection."""
    if not isinstance(métier, Metier):
        raise ValueError("Invalid métier. It must be an instance of Metier enum.")
    user_document = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "password": password,  # Consider hashing the password
        "type": Type.EMPLOYE.value,
        "métier": métier.value
    }
    result = user_collection.insert_one(user_document)
    print(f"Inserted user with ID: {result.inserted_id}")
    return str(result.inserted_id)

def add_company(company_name: str, email: str, password: str, secteur: Secteur) -> str:
    """Add a new company to the collection."""
    # Hash the password
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
    """Add a new company to the collection."""
    if not isinstance(secteur, Secteur):
        raise ValueError("Invalid secteur. It must be an instance of Secteur enum.")
    company_document = {
        "company_name": company_name,
        "email": email,
        "password": password,  # Consider hashing the password
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
        return False  # User does not exist

    print(f"User found: {user}")  # Debugging line

    hashed_password = user["password"].encode('utf-8')  # Convert stored password to bytes
    password = password.encode('utf-8')  # Convert input password to bytes

    if bcrypt.checkpw(password, hashed_password):  # Verify password
        print("Login successful.")
        return True  # Authentication successful
    else:
        print("Incorrect password.")
        return False  # Authentication failed

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

# Example Usage
if __name__ == "__main__":
    # Add a user
    add_user("John", "Doe", "john.doe@example.com", "password123", Metier.DEVELOPPEUR)

    # Add a company
    add_company("Tech Corp", "tech@example.com", "securepassword", Secteur.INFORMATIQUE)

    # Find all users
    users = find_all_users()
    printer.pprint(users)

    # Count users
    count_all_users()