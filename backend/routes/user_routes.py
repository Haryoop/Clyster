from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from connection import db
from datetime import datetime

user_bp = Blueprint('user_bp', __name__)

user_collection = db['user']

# Route: Get all users
@user_bp.route('/users', methods=['GET'])
def get_all_users():
    users = list(user_collection.find({}, {"_id": 1, "first_name": 1, "last_name": 1, "birth_date": 1}))
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON
    return jsonify(users), 200


# Route: Add a new user
@user_bp.route('/users', methods=['POST'])
def add_user():
    data = request.json
    if not data.get("first_name") or not data.get("last_name") or not data.get("birth_date"):
        return jsonify({"error": "Missing fields"}), 400
    try:
        birth_date = datetime.strptime(data["birth_date"], '%Y-%m-%d')  # Parse birth_date to datetime
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_user = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "birth_date": birth_date
    }
    result = user_collection.insert_one(new_user)
    return jsonify({"message": "User added", "id": str(result.inserted_id)}), 201

# Route: Update a user by ID
@user_bp.route('/users/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    updated_fields = {}
    if "first_name" in data:
        updated_fields["first_name"] = data["first_name"]
    if "last_name" in data:
        updated_fields["last_name"] = data["last_name"]
    if "birth_date" in data:
        try:
            updated_fields["birth_date"] = datetime.strptime(data["birth_date"], '%Y-%m-%d')  # Parse birth_date
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if not updated_fields:
        return jsonify({"error": "No fields to update"}), 400

    result = user_collection.update_one({"_id": ObjectId(user_id)}, {"$set": updated_fields})
    if result.matched_count:
        return jsonify({"message": "User updated"}), 200
    return jsonify({"error": "User not found"}), 404

# Route: Delete a user by ID
@user_bp.route('/users/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    result = user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count:
        return jsonify({"message": "User deleted"}), 200
    return jsonify({"error": "User not found"}), 404
