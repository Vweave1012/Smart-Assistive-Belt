# server/app.py
# server/app.py
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.exceptions import BadRequest
from flask_cors import CORS
import os
from datetime import datetime  # ADDED HERE
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# Import ML engine
from ml_engine.inference import predict_state

# Import all needed logic functions - ADDED save_state HERE
from logic.time_manager import apply_time_logic, update_event, load_state, save_state 

# Auth blueprint
from auth import auth_bp

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# set secrets from .env (fallback only for local dev)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY") or "dev_jwt_secret"
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", app.config["JWT_SECRET_KEY"])

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# then register blueprints and the rest of your file...
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api")


@app.route("/")
def home():
    # serve the UI index if built in `static` / `templates`
    try:
        return send_from_directory(app.template_folder, "index.html")
    except Exception:
        return "Smart Assistive Belt API"
    
@app.route("/api/predict", methods=["POST"])
# @jwt_required()  # Commented for demo if ESP32 doesn't send token
def api_predict():
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("JSON body required")
            
        # ML prediction
        ml = predict_state(data)
        ml_raw = ml["ml_raw"]
        ml_prob = ml.get("ml_prob", None)
        probs = ml.get("probs", {})

        # final validation by time_manager
        final = apply_time_logic(ml_raw, data.get("fsr_pct", 0.0))

        # ===== SAVE FINAL STATE FOR FRONTEND =====
        # (Removed local imports from here - they are now at the top)
        try:
            state = load_state()
            state["last_final_state"] = final
            state["last_final_state_time"] = datetime.now().isoformat()
            save_state(state)  # This will now work!
        except Exception as e:
            app.logger.warning(f"Failed to store final_state: {e}")

        resp = {
            "timestamp": ml["timestamp"],
            "ml_raw": ml_raw,
            "ml_prob": ml_prob,
            "probs": probs,
            "final_state": final
        }
        return jsonify(resp)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
# @app.route("/api/predict", methods=["POST"])
# @jwt_required()
# def api_predict():
#     user_id = get_jwt_identity()
#     print("Prediction requested by user:", user_id)

#     """
#     Expects JSON:
#     {
#       "fsr_pct": float,
#       "motion": float,
#       "rotation": float,
#       "trend": float
#     }
#     Returns:
#     {
#       timestamp, ml_raw, ml_prob, probs, final_state
#     }
#     """
#     try:
#         data = request.get_json()
#         if not data:
#             raise BadRequest("JSON body required")
#         # ML prediction
#         ml = predict_state(data)
#         ml_raw = ml["ml_raw"]
#         ml_prob = ml.get("ml_prob", None)
#         probs = ml.get("probs", {})

#         # final validation by time_manager
#         final = apply_time_logic(ml_raw, data.get("fsr_pct", 0.0))

#         # ===== SAVE FINAL STATE FOR FRONTEND =====
#         from logic.time_manager import load_state, save_state
#         from datetime import datetime

#         try:
#             state = load_state()
#             state["last_final_state"] = final
#             state["last_final_state_time"] = datetime.now().isoformat()
#             save_state(state)
#         except Exception as e:
#             app.logger.warning(f"Failed to store final_state: {e}")


#         resp = {
#             "timestamp": ml["timestamp"],
#             "ml_raw": ml_raw,
#             "ml_prob": ml_prob,
#             "probs": probs,
#             "final_state": final
#         }
#         return jsonify(resp)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

@app.route("/api/update_event", methods=["POST"])
def api_update_event():
    """
    Confirmed caregiver action to update timestamps.
    JSON: {"final_state": "HUNGER" | "PEE" | "POOP"}
    """
    try:
        data = request.get_json()
        final_state = data.get("final_state")
        if final_state not in ("HUNGER", "PEE", "POOP"):
            raise BadRequest("final_state must be one of HUNGER, PEE, POOP")
        new_state = update_event(final_state)
        return jsonify({"ok": True, "state": new_state})
    except BadRequest as br:
        return jsonify({"error": str(br)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/state", methods=["GET"])
def api_state():
    st = load_state()
    return jsonify(st)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
