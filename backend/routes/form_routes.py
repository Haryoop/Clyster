from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from connection import db
from models.form import generate_questions, check_form_exists
from models.user import mark_user_as_tested
import datetime

# Database collections
user_collection = db['user']  # This was missing
form_collection = db['form']

form_bp = Blueprint('form_bp', __name__)

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

@form_bp.route('/forms/<form_id>', methods=['GET'])
def get_form(form_id):
    try:
        form = form_collection.find_one({"_id": ObjectId(form_id)})
        if not form:
            return jsonify({"error": "Form not found"}), 404
        
        # Convert ObjectId and datetime to strings
        form['_id'] = str(form['_id'])
        if 'user_id' in form:
            form['user_id'] = str(form['user_id'])
        if 'candidat_id' in form:
            form['candidat_id'] = str(form['candidat_id'])
        
        return jsonify(form), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route('/api/forms/user/<user_id>', methods=['GET'])
def get_forms_by_user(user_id):
    try:
        forms = list(form_collection.find({
            "$or": [
                {"user_id": ObjectId(user_id)},
                {"candidat_id": ObjectId(user_id)}
            ]
        }))
        
        # Convert ObjectIds to strings
        for form in forms:
            form['_id'] = str(form['_id'])
            if 'user_id' in form:
                form['user_id'] = str(form['user_id'])
            if 'candidat_id' in form:
                form['candidat_id'] = str(form['candidat_id'])
        
        return jsonify(forms), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route('/forms/<form_id>/responses', methods=['PUT'])
def save_responses(form_id):
    try:
        data = request.get_json()
        
        update_result = form_collection.update_one(
            {"_id": ObjectId(form_id)},
            {"$set": {
                "reponse1": data.get("reponse1", ""),
                "reponse2": data.get("reponse2", ""),
                "reponse3": data.get("reponse3", ""),
                "reponse4": data.get("reponse4", ""),
                "reponse5": data.get("reponse5", ""),
                "completed_at": datetime.datetime.now()
            }}
        )
        
        if update_result.modified_count == 0:
            return jsonify({"error": "Form not found or no changes made"}), 404
            
        return jsonify({"message": "Responses saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@form_bp.route('/api/forms/check-or-create', methods=['POST'])
def check_or_create_form():
    try:
        data = request.get_json()
        candidat_id = data.get('candidat_id')
        
        if not candidat_id:
            return jsonify({"error": "candidat_id is required"}), 400
        
        if not ObjectId.is_valid(candidat_id):
            return jsonify({"error": "Invalid ID format"}), 400

        # Check for existing form
        form = form_collection.find_one({"candidat_id": '67fea3a7b205a66ef260a5cf'})
        if form:
            return jsonify({
                "status": "exists",
                "form_id": str(form["_id"]),
                "questions": [
                    form.get("question1", ""),
                    form.get("question2", ""),
                    form.get("question3", ""),
                    form.get("question4", ""),
                    form.get("question5", "")
                ]
            })

        # If no form exists, create one
        user = user_collection.find_one({"_id": ObjectId(candidat_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Generate new form
        form_data = generate_questions(candidat_id)
        if not form_data:
            return jsonify({"error": "Failed to generate form"}), 500

        return jsonify({
            "status": "created",
            "form_id": form_data["form_id"],
            "questions": form_data["questions"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Add this new endpoint to your existing form_routes.py
@form_bp.route('/has-test/<user_id>', methods=['GET'])
def has_test(user_id):
    try:
        user_id = user_id.strip()
        if not ObjectId.is_valid(user_id):
            return jsonify({"error": "Invalid ID format"}), 400

        user_oid = ObjectId(user_id)
        
        # Debug: Log the ID being queried
        print(f"Querying forms for candidat_id: {user_oid}")

        form = form_collection.find_one({"candidat_id": user_oid})
        
        if form:
            return jsonify({
                "has_test": True,
                "form_id": str(form["_id"]),
                "is_completed": bool(form.get("completed_at"))
            })
            
        return jsonify({
            "has_test": False,
            "message": "No test form found for this user"
        })
        
    except Exception as e:
        print(f"Error in has_test: {str(e)}")
        return jsonify({"error": str(e)}), 500