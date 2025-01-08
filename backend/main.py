import models.person as person

#person.add_person("haroun", "jemaa", 25)
#person.UpdatePerson("fathi")
#person.deletePerson("6761de1a687e6896e67fbf4f")

from flask import Flask
from flask_cors import CORS
from routes import person_bp  # Import the routes Blueprint

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

# Register the routes blueprint
app.register_blueprint(person_bp, url_prefix='/api')

# Default route to test server
@app.route('/')
def home():
    return {"message": "Welcome to the Flask MongoDB API!"}

# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
