# server/app.py
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.exceptions import BadRequest
from ml_engine.inference import predict_state
from logic.time_manager import apply_time_logic, update_event, load_state
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

@app.route("/")
def home():
    # serve the UI index if built in `static` / `templates`
    try:
        return send_from_directory(app.template_folder, "index.html")
    except Exception:
        return "Smart Assistive Belt API"

@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    Expects JSON:
    {
      "fsr_pct": float,
      "motion": float,
      "rotation": float,
      "trend": float
    }
    Returns:
    {
      timestamp, ml_raw, ml_prob, probs, final_state
    }
    """
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
        from logic.time_manager import load_state, save_state
        from datetime import datetime

        try:
            state = load_state()
            state["last_final_state"] = final
            state["last_final_state_time"] = datetime.now().isoformat()
            save_state(state)
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
