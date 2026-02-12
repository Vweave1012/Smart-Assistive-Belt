import joblib
import numpy as np
import tensorflow as tf
import os

class MLInference:
    def __init__(self, model_path='server/ml_engine/model.pkl', scaler_path='server/ml_engine/scaler.pkl'):
        # Labels must match your LabelEncoder classes from Colab
        self.labels = ['HIGHLY_RESTLESS', 'NORMAL', 'NO_USER', 'RESTLESS']
        
        # Load the binary model and scaler
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = tf.keras.models.load_model(model_path)
            self.scaler = joblib.load(scaler_path)
            self.ready = True
        else:
            print("⚠️ ML files missing. Using fallback logic.")
            self.ready = False

    def predict(self, data):
        if not self.ready:
            return None

        # Prepare features in the exact order used in training
        features = np.array([[
            data.get('fsr_pct', 0),
            data.get('present', 0),
            data.get('motion', 0),
            data.get('rotation', 0),
            data.get('system_ok', 0)
        ]])

        # Scale the data using the binary scaler.pkl
        scaled_features = self.scaler.transform(features)
        
        # Run inference
        prediction = self.model.predict(scaled_features, verbose=0)
        class_idx = np.argmax(prediction)
        
        return self.labels[class_idx]