from dotenv import load_dotenv, find_dotenv
import os
import pprint
from pymongo import MongoClient

load_dotenv(find_dotenv())
password=os.environ.get("MONGODB_PWD")
connection_string= f"mongodb+srv://haryoop:{password}@cluster0.idq0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Initialize the client and database
client = MongoClient(connection_string)
db = client['Clyster']  # Replace 'Clyster' with your actual database name