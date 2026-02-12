import joblib
import numpy as np
import tensorflow as tf # Re-add TensorFlow
import os

class MLInference:
    def __init__(self, model_path='server/ml_engine/model.h5', scaler_path='server/ml_engine/scaler.pkl'):
        # Labels MUST match the order of your training classes
        self.labels = ['HIGHLY_RESTLESS', 'NORMAL', 'NO_USER', 'RESTLESS']
        
        # Load the .h5 model using TensorFlow
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = tf.keras.models.load_model(model_path)
            self.scaler = joblib.load(scaler_path)
            self.ready = True
        else:
            print(f"⚠️ ML files missing. Paths checked: {model_path}, {scaler_path}")
            self.ready = False

    def predict(self, data):
        if not self.ready:
            return "WAITING_FOR_BELT"

        # 1. Prepare features in the exact training order
        features = np.array([[
            data.get('fsr_pct', 0),
            data.get('present', 0),
            data.get('motion', 0),
            data.get('rotation', 0),
            data.get('system_ok', 0)
        ]])

        # 2. Scale features using the .pkl scaler
        scaled_features = self.scaler.transform(features)
        
        # 3. Run Keras inference
        # Keras .predict() returns a 2D array of probabilities (e.g., [[0.1, 0.8, 0.05, 0.05]])
        prediction_probs = self.model.predict(scaled_features, verbose=0)
        
        # 4. Extract the index with the highest probability
        class_idx = np.argmax(prediction_probs)
        
        # 5. Return the human-readable label
        return self.labels[class_idx]