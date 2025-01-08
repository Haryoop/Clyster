from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from connection import db  # Import your database connection

# Blueprint for routes
person_bp = Blueprint('person_bp', __name__)

# MongoDB collection
person_collection = db['person']

# Route: Get all people
@person_bp.route('/people', methods=['GET'])
def get_all_people():
    people = list(person_collection.find({}, {"_id": 1, "first_name": 1, "last_name": 1, "age": 1}))
    for person in people:
        person["_id"] = str(person["_id"])  # Convert ObjectId to string for JSON
    return jsonify(people), 200

# Route: Add a new person
@person_bp.route('/people', methods=['POST'])
def add_person():
    data = request.json
    if not data.get("first_name") or not data.get("last_name") or not data.get("age"):
        return jsonify({"error": "Missing fields"}), 400
    new_person = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "age": data["age"]
    }
    result = person_collection.insert_one(new_person)
    return jsonify({"message": "Person added", "id": str(result.inserted_id)}), 201

# Route: Update a person by ID
@person_bp.route('/people/<string:person_id>', methods=['PUT'])
def update_person(person_id):
    data = request.json
    updated_fields = {"$set": {
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "age": data.get("age")
    }}
    result = person_collection.update_one({"_id": ObjectId(person_id)}, updated_fields)
    if result.matched_count:
        return jsonify({"message": "Person updated"}), 200
    return jsonify({"error": "Person not found"}), 404

# Route: Delete a person by ID
@person_bp.route('/people/<string:person_id>', methods=['DELETE'])
def delete_person(person_id):
    result = person_collection.delete_one({"_id": ObjectId(person_id)})
    if result.deleted_count:
        return jsonify({"message": "Person deleted"}), 200
    return jsonify({"error": "Person not found"}), 404
