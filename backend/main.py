import models.user as user
import os
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required, create_access_token
from authentication.routes import api
from flask import Flask
from flask_cors import CORS
import models.form as form
from routes.user_routes import user_bp

app = Flask(__name__)




app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET")
jwt = JWTManager(app)

CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(api, url_prefix='/api')
form.generate_questions("plombier")


@app.route('/')
def home():
    return {"message": "Welcome to the Flask MongoDB API!"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
