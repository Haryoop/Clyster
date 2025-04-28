from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from connection import db
from models.form import generate_questions
from models.user import mark_user_as_tested
import datetime

form_bp = Blueprint('form_bp', __name__)
form_collection = db['form']

@form_bp.route('/forms/generate/<user_id>', methods=['POST'])
def generate_form(user_id):
    try:
        # Generate questions and create form
        form = generate_questions(user_id)
        if not form:
            return jsonify({"error": "Failed to generate form"}), 400
        
        # Mark user as tested
        success = mark_user_as_tested(user_id)
        if not success:
            # Rollback form creation if marking as tested fails
            form_collection.delete_one({"_id": ObjectId(form["form_id"])})
            return jsonify({"error": "Failed to update user status"}), 400
        
        return jsonify({
            "message": "Form generated successfully",
            "form_id": form["form_id"],
            "user_id": user_id,
            "metier": form["metier"],
            "questions": form["questions"]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route('/api/forms/<form_id>', methods=['GET'])
def get_form(form_id):
    try:
        form = form_collection.find_one({"_id": ObjectId(form_id)})
        if not form:
            return jsonify({"error": "Form not found"}), 404
        
        # Convert ObjectId and datetime to strings
        form['_id'] = str(form['_id'])
        form['user_id'] = str(form['user_id'])
        
        return jsonify(form), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route('/api/forms/user/<user_id>', methods=['GET'])
def get_forms_by_user(user_id):
    try:
        forms = list(form_collection.find({"user_id": ObjectId(user_id)}))
        
        # Convert ObjectIds to strings
        for form in forms:
            form['_id'] = str(form['_id'])
            form['user_id'] = str(form['user_id'])
        
        return jsonify(forms), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route('/api/forms/<form_id>/responses', methods=['PUT'])
def save_responses(form_id):
    try:
        data = request.get_json()
        
        required_fields = [
            "reponse1", "reponse2", "reponse3", 
            "reponse4", "reponse5"
        ]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        update_result = form_collection.update_one(
            {"_id": ObjectId(form_id)},
            {"$set": {
                "reponse1": data["reponse1"],
                "reponse2": data["reponse2"],
                "reponse3": data["reponse3"],
                "reponse4": data["reponse4"],
                "reponse5": data["reponse5"],
                "completed_at": datetime.datetime.now()
            }}
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "Form not found or no changes made"}), 404
            
        return jsonify({"message": "Responses saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500