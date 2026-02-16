from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

print("Trying to connect...")

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=30000
)

print("Connected successfully!")
print(client.list_database_names())
