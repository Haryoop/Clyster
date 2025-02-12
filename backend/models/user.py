import pprint
from datetime import date
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel

client = MongoClient(connection_string)
Clyster = client.Clyster
user_collection = Clyster.user
printer = pprint.PrettyPrinter()
test_db = client.Clyster

def find_all_users():
    people = list(user_collection.find())
    return people

def add_user(first_name: str, last_name: str, birth_date: date):
    collection = Clyster.user
    test_document = {
        "first_name": first_name,
        "last_name": last_name,
        "birth_date": birth_date  # Changed field to birth_date
    }
    inserted_id = collection.insert_one(test_document).inserted_id
    print(f"Inserted user with ID: {inserted_id}")

def add_company(company_name: str, email: str, password: str):
    collection = Clyster.user
    test_document = {
        "company_name": company_name,
        "email": email,
        "passwoord": password
    }
    inserted_id = collection.insert_one(test_document).inserted_id
    print(f"Inserted company with ID: {inserted_id}")

def get_by_fname(first_name):
    user = user_collection.find_one({"first_name": first_name})
    printer.pprint(user)

def count_all_users():
    count = user_collection.count_documents(filter={})
    print('Number of people:', count)

def get_user_by_id(user_id):
    from bson.objectid import ObjectId
    _id = ObjectId(user_id)
    user = user_collection.find_one({"_id": _id})
    printer.pprint(user)
    return user

def get_birth_date_range(start_date: date, end_date: date):
    query = {
        "$and": [
            {"birth_date": {"$gte": start_date}},
            {"birth_date": {"$lte": end_date}}
        ]
    }
    users = user_collection.find(query).sort("birth_date")
    for user in users:
        printer.pprint(user)

def project_columns():
    columns = {"_id": 0, "first_name": 1, "last_name": 1, "birth_date": 1}
    users = user_collection.find({}, columns)
    for user in users:
        printer.pprint(user)

def update_user_by_id(user_id):
    from bson.objectid import ObjectId
    _id = ObjectId(user_id)
    user_collection.update_one({"_id": _id}, {"$unset": {"new_field": ""}})

def update_user(user_id, newFirst_name: str, newLast_name: str, newBirth_date: date):
    from bson.objectid import ObjectId
    _id = ObjectId(user_id)
    update_fields = {
        "$set": {
            "first_name": newFirst_name,
            "last_name": newLast_name,
            "birth_date": newBirth_date
        }
    }
    result = user_collection.update_one({"_id": _id}, update_fields)
    if result.matched_count > 0:
        print("User updated successfully.")
    else:
        print("User not found.")

def delete_user(user_id):
    from bson.objectid import ObjectId
    try:
        _id = ObjectId(user_id)
        result = user_collection.delete_one({"_id": _id})
        if result.deleted_count > 0:
            print(f"User with ID {user_id} deleted successfully.")
        else:
            print(f"No user found with ID {user_id}.")
    except Exception as e:
        print(f"Error occurred: {e}")
