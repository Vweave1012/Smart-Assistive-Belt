from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from db import users_col
from datetime import datetime

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()


# REGISTER
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Missing fields"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    }

    users_col.insert_one(user)

    return jsonify({"message": "User registered successfully"})


# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = users_col.find_one({"email": email})

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "token": token,
        "name": user["name"],
        "email": user["email"]
    })


# PROFILE (protected route)
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    user = users_col.find_one({"_id": users_col.database.client.get_default_database().codec_options.document_class(user_id)})

    return jsonify({
        "name": user["name"],
        "email": user["email"]
    })
