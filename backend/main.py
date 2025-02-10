import models.user as user
import os
#person.add_person("haroun", "jemaa", 25)
#person.UpdatePerson("fathi")
#person.deletePerson("6761de1a687e6896e67fbf4f")
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required, create_access_token
from authentication.routes import api
from flask import Flask
from flask_cors import CORS
from routes.user_routes import user_bp  # Import the routes Blueprint

# Initialize Flask app
app = Flask(__name__)


app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET")
jwt = JWTManager(app)


CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

# Register the routes blueprint
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(api, url_prefix='/api')


# Default route to test server
@app.route('/')
def home():
    return {"message": "Welcome to the Flask MongoDB API!"}

# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
