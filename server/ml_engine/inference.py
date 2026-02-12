import joblib
import numpy as np
import os
import tensorflow as tf  # FIXED: Required for .h5 models

class MLInference:
    def __init__(self, model_path='ml_engine/event_ml_model.h5', scaler_path='ml_engine/scaler.pkl'):
        self.labels = ['HIGHLY_RESTLESS', 'NORMAL', 'NO_USER', 'RESTLESS']
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            # FIXED: Use Keras for the .h5 model
            self.model = tf.keras.models.load_model(model_path) 
            # Scaler still uses joblib as it is a .pkl
            self.scaler = joblib.load(scaler_path)
            self.ready = True
        else:
            print(f"⚠️ ML files missing at {model_path}. Using fallback logic.")
            self.ready = False

    def predict(self, data):
        if not self.ready:
            return "WAITING_FOR_BELT"

        features = np.array([[
            data.get('fsr_pct', 0),
            data.get('present', 0),
            data.get('motion', 0),
            data.get('rotation', 0),
            data.get('system_ok', 0)
        ]])

        scaled_features = self.scaler.transform(features)
        
        # FIXED: Keras models return probabilities, use argmax to get the index
        prediction_probs = self.model.predict(scaled_features, verbose=0)
        class_idx = np.argmax(prediction_probs)
        
        return self.labels[class_idx]