from flask import Flask, request, jsonify, render_template
import time
import os

# IMPORT YOUR CUSTOM MODULES
from logic.time_manager import TimeManager 
from ml_engine.inference import MLInference 

app = Flask(__name__)

# INITIALIZE ENGINES
# This loads model.pkl and scaler.pkl once when the server starts
engine = MLInference(model_path="ml_engine/model.pkl", scaler_path="ml_engine/scaler.pkl")
tm = TimeManager() 

# =========================================================
# MAIN API ENDPOINTS
# =========================================================

@app.route("/data", methods=["POST"])
def receive_data():
    try:
        data = request.get_json(force=True)
        print("\n📥 ESP Data:", data)

        # 1. Get Physical State using the ML Engine
        # This replaces your old manual if/else logic
        prediction = engine.predict(data)
        
        # Fallback if ML fails (e.g., files missing)
        if prediction is None:
            prediction = "ML_ENGINE_OFFLINE"

        # 2. Apply Time-Lapse Context (Phase 3)
        # This checks TSLM/TSLU to see if it's really Hunger or Toilet Need
        final_status = tm.evaluate_context(prediction)

        # Update the app state so the dashboard can see it
        app.last_status = final_status

        print(f"🧠 ML State: {prediction} | 🕒 Final Status: {final_status}")

        return jsonify({
            "timestamp": time.time(),
            "raw_prediction": prediction,
            "final_status": final_status
        }), 200

    except Exception as e:
        print("❌ Server Error:", e)
        return jsonify({"error": str(e)}), 500

# Endpoint for Caregiver Dashboard Buttons
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

# ROUTES FOR CAREGIVER UI
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_latest_status')
def get_latest_status():
    # Dashboard calls this every 2 seconds to update the screen
    status = getattr(app, 'last_status', 'WAITING_FOR_BELT')
    return jsonify({"final_status": status})

if __name__ == "__main__":
    # Runs on port 5000, accessible to ESP32 on same WiFi
    app.run(host="0.0.0.0", port=5000)