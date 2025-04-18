from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from connection import db
from datetime import datetime
from flask_cors import cross_origin
import bcrypt

user_bp = Blueprint('user_bp', __name__)

user_collection = db['user']

@user_bp.route('/users', methods=['GET'])
@cross_origin()
def get_all_users():
    users = list(user_collection.find({}, {"_id": 1, "first_name": 1, "last_name": 1, "email": 1, "métier": 1}))
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users), 200

@user_bp.route('/users', methods=['POST'])
def add_user():
    data = request.json
    required_fields = ["first_name", "last_name", "email", "password", "métier"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())
    birth_date = None
    if data.get("birth_date"):
        try:
            birth_date = datetime.strptime(data["birth_date"], '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format for birth_date. Use YYYY-MM-DD"}), 400
    new_user = {
        "type": "candidat",
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "password": hashed_password.decode('utf-8'),
        "métier": data["métier"],
        "birth_date": birth_date,
        "IsTested": False
    }
    result = user_collection.insert_one(new_user)
    return jsonify({"message": "User added", "id": str(result.inserted_id)}), 201

# Route: Add a new company
@user_bp.route('/companies', methods=['POST'])
def add_company():
    data = request.json
    required_fields = ["company_name", "email", "password", "secteur"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())
    new_user = {
        "type": "entreprise",
        "company_name": data["company_name"],
        "email": data["email"],
        "password": hashed_password.decode('utf-8'),
        "secteur": data["secteur"]
    }
    result = user_collection.insert_one(new_user)
    return jsonify({"message": "User added", "id": str(result.inserted_id)}), 201
# Route: Update a user by ID
@user_bp.route('/users/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    updated_fields = {}

    # Add fields to update if they exist in the request
    if "first_name" in data:
        updated_fields["first_name"] = data["first_name"]
    if "last_name" in data:
        updated_fields["last_name"] = data["last_name"]
    if "email" in data:
        updated_fields["email"] = data["email"]
    if "password" in data:
        updated_fields["password"] = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    if "métier" in data:
        updated_fields["métier"] = data["métier"]
    if "birth_date" in data:
        try:
            updated_fields["birth_date"] = datetime.strptime(data["birth_date"], '%Y-%m-%d')  # Parse birth_date
        except ValueError:
            return jsonify({"error": "Invalid date format for birth_date. Use YYYY-MM-DD"}), 400

    if not updated_fields:
        return jsonify({"error": "No fields to update"}), 400

    # Update the user in the database
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

@user_bp.route('/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400
    existing_user = user_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200
    
@user_bp.route('/users/profile', methods=['GET'])
@cross_origin()
def get_user_profile():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    user = user_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])  
    return jsonify(user), 200

@user_bp.route('/users/untested', methods=['GET'])
@cross_origin()
def get_untested_users():
    try:
        # Find all candidate users who haven't been tested yet
        users = list(user_collection.find({
            "type": "candidat",
            "IsTested": False
        }, {
            "_id": 1,
            "first_name": 1,
            "last_name": 1,
            "email": 1,
            "métier": 1,
            "birth_date": 1
        }))
        
        # Convert ObjectId to string and format birth_date if it exists
        for user in users:
            user["_id"] = str(user["_id"])
            if user.get("birth_date"):
                user["birth_date"] = user["birth_date"].isoformat()
        
        return jsonify(users), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500