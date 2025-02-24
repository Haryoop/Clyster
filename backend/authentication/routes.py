from flask import Flask, request, jsonify, url_for, Blueprint
import os
from authentication.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity
from models import user



api = Blueprint('api', __name__)

@api.route("/token", methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    if user.login(email, password)==False:
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token)
