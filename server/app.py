from flask import Flask, request, jsonify
import time
import os
import numpy as np
import joblib
from flask import render_template

# IMPORT THE TIME MANAGER FROM YOUR LOGIC FOLDER
from logic.time_manager import TimeManager #

app = Flask(__name__)
tm = TimeManager() # Create the time tracking object

# =========================================================
# LOAD ML MODEL FROM CORRECT FOLDER
# =========================================================
USE_ML = False
model = None
scaler = None
labels = ["NORMAL", "RESTLESS", "HIGHLY_RESTLESS", "NO_USER", "ACTIVE"]

# Update paths to look inside 'ml_engine' folder
model_path = "ml_engine/event_ml_model.h5"
scaler_path = "ml_engine/scaler.pkl"

if os.path.exists(model_path) and os.path.exists(scaler_path):
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(model_path)
        scaler = joblib.load(scaler_path)
        USE_ML = True
        print("✅ ML model + scaler loaded from ml_engine/")
    except Exception as e:
        print(f"❌ Error loading ML model: {e}")
else:
    print("⚠️ ML files not found in ml_engine/ → using rule-based logic")

# =========================================================
# PREDICTION LOGIC (Merged Rule + ML)
# =========================================================
def get_prediction(data):
    system_ok = data.get("system_ok", 0)
    present = data.get("present", 0)
    fsr = data.get("fsr_pct", 0)
    motion = data.get("motion", 0)
    rotation = data.get("rotation", 0)

    # Safety checks
    if system_ok == 0: return "SYSTEM_ERROR"
    if present == 0 or fsr < 5: return "NO_USER"

    # Activity/Restlessness logic
    if motion > 50000 and fsr < 25: return "ACTIVE"
    if motion > 45000 or rotation > 20000: return "HIGHLY_RESTLESS"
    if motion > 33000 or rotation > 1500: return "RESTLESS"
    
    return "NORMAL"

# =========================================================
# MAIN API ENDPOINTS
# =========================================================

@app.route("/data", methods=["POST"])
def receive_data():
    try:
        data = request.get_json(force=True)
        print("\n📥 ESP Data:", data)

        # 1. Get Physical State from Sensors
        prediction = get_prediction(data)

        # 2. Apply Time-Lapse Logic (Phase 3)
        # This checks if enough time passed since last meal/toilet
        final_status = tm.evaluate_context(prediction)

        print(f"🧠 ML State: {prediction} | 🕒 Final Status: {final_status}")

        return jsonify({
            "timestamp": time.time(),
            "raw_prediction": prediction,
            "final_status": final_status
        }), 200

    except Exception as e:
        print("❌ Server Error:", e)
        return jsonify({"error": "server_failure"}), 500

# Endpoint for Caregiver "One-Time" inputs
@app.route("/reset_timer", methods=["POST"])
def reset_timer():
    event_type = request.json.get("event") # 'meal' or 'toilet'
    if event_type == 'meal':
        tm.update_meal_time()
        return jsonify({"msg": "Meal timer reset"}), 200
    elif event_type == 'toilet':
        tm.update_toilet_time()
        return jsonify({"msg": "Toilet timer reset"}), 200
    return jsonify({"error": "invalid event"}), 400
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_latest_status')
def get_latest_status():
    # This assumes you have a global variable tracking the last prediction
    # For now, we return a sample to test the UI
    return jsonify({"final_status": getattr(app, 'last_status', 'WAITING_FOR_BELT')})
if __name__ == "__main__":
    # Runs on port 5000, accessible to ESP32 on same WiFi
    app.run(host="0.0.0.0", port=5000)