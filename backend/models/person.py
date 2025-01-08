import pprint
from connection import connection_string
from pymongo import MongoClient
from pydantic import BaseModel

client=MongoClient(connection_string)
Clyster=client.Clyster
person_collection=Clyster.person
printer = pprint.PrettyPrinter()
test_db=client.Clyster


def find_all_people():
    people = list(person_collection.find())
    return people

def insert_test_doc():
    collection=test_db.Clyster
    test_document={
        "name":"Haroun",
        "type":"test"
    }
    inserted_id=collection.insert_one(test_document).inserted_id
    print(f"Inserted document with ID: {inserted_id}")
    #print(inserted_id)

def add_person(first_name: str, last_name: str, age: int):
    collection = Clyster.person
    test_document = {
        "first_name": first_name,
        "last_name": last_name,
        "age": age
    }
    inserted_id = collection.insert_one(test_document).inserted_id
    print(f"Inserted document with ID: {inserted_id}")


def create_documents():
    first_names=["Tim","Sarah","Haroun","Ahmed"]
    last_names=["Ber","Trad","Jemaa","Mahjoub"]
    ages=[20,21,24,24]

    docs=[]


    for first_name, last_name, age in zip(first_names,last_names,ages):
        doc={"first_name": first_name, "last_name": last_name, "age": age}
        docs.append(doc)
        #person_collection.insert_one(doc)
    person_collection.insert_many(docs)





def get_by_fname(first_name):
    haroun=person_collection.find_one({"first_name":first_name})
    printer.pprint(haroun)

def count_all_people():
    count=person_collection.count_documents(filter={})
    print('number of people', count)

def get_person_by_id(person_id):
    from bson.objectid import ObjectId
    _id = ObjectId(person_id)
    person = person_collection.find_one({"_id":_id})
    printer.pprint(person)
    return person

def get_age_range(min_age, max_age):
    query = {
        "$and": [
            {"age": {"$gte": min_age}},
            {"age": {"$lte": max_age}}
        ]
    }
    people = person_collection.find(query).sort("age")
    for person in people:
        printer.pprint(person)

def project_columns():
    columns = {"_id":0, "first_name":1,"last_name":1}
    people = person_collection.find({},columns)
    for person in people:
        printer.pprint(person)

def update_person_by_id(person_id):
    from bson.objectid import ObjectId
    _id = ObjectId(person_id)
    #all_updates={
    #    "$set":{"new_field":True},
    #    "$inc":{"age":1},
    #    "$rename":{"first_name":"first","last_name":"last"}
    #}
    #person_collection.update_one({"_id":_id}, all_updates)

    person_collection.update_one({"_id":_id},{"$unset":{"new_field":""}})

'''def UpdatePerson(person_id, newFirst_name: str, newLast_name: str, newAge: int):
    from bson.objectid import ObjectId
    _id = ObjectId(person_id)
    new_doc={
        "first_name":newFirst_name,
        "last_name":newLast_name,
        "age":newAge
    }
    print("person updated")
    person_collection.replace_one({"_id":_id},new_doc)'''
def UpdatePerson(person_id, newFirst_name: str, newLast_name: str, newAge: int):
    from bson.objectid import ObjectId
    _id = ObjectId(person_id)
    update_fields = {
        "$set": {
            "first_name": newFirst_name,
            "last_name": newLast_name,
            "age": newAge
        }
    }
    result = person_collection.update_one({"_id": _id}, update_fields)
    if result.matched_count > 0:
        print("Person updated successfully.")
    else:
        print("Person not found.")


def deletePerson(person_id):
    from bson.objectid import ObjectId
    try:
        _id = ObjectId(person_id)  # Convert string to ObjectId
        result = person_collection.delete_one({"_id": _id})  # Delete document
        if result.deleted_count > 0:
            print(f"Person with ID {person_id} deleted successfully.")
        else:
            print(f"No person found with ID {person_id}.")
    except Exception as e:
        print(f"Error occurred: {e}")
