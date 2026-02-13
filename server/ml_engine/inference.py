# server/ml_engine/inference.py
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # server/
MODEL_PATH = os.path.join(BASE_DIR, "ml_engine", "smart_belt_rf.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml_engine", "scaler.pkl")
LABEL_MAP_PATH = os.path.join(BASE_DIR, "ml_engine", "label_map.pkl")

# load once at import time
_model = None
_scaler = None
_label_map = None
_inv_label_map = None

def _load_artifacts():
    global _model, _scaler, _label_map, _inv_label_map
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")
        if not os.path.exists(LABEL_MAP_PATH):
            raise FileNotFoundError(f"Label map not found: {LABEL_MAP_PATH}")

        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _label_map = joblib.load(LABEL_MAP_PATH)
        # invert mapping: int -> label
        _inv_label_map = {v: k for k, v in _label_map.items()}

# public API
def predict_state(sensor_data: dict):
    """
    sensor_data must contain numeric keys:
      - fsr_pct, motion, rotation, trend
    Returns:
      {
        "timestamp": ISO,
        "ml_raw": "<label name>",
        "ml_index": <int label>,
        "ml_prob": <float probability of predicted class>,
        "probs": {label: prob, ...}
      }
    """
    _load_artifacts()

    # required order of features used during training
    features = ["fsr_pct", "motion", "rotation", "trend"]

    # put values into a 2D array for scaler / model
    try:
        row = [float(sensor_data.get(f, 0.0)) for f in features]
    except Exception as e:
        raise ValueError("Sensor values must be numeric") from e

    X = np.array(row).reshape(1, -1)
    Xs = _scaler.transform(X)  # scaled

    # predict with RF
    pred_idx = int(_model.predict(Xs)[0])
    proba = None
    probs_map = {}
    if hasattr(_model, "predict_proba"):
        proba_arr = _model.predict_proba(Xs)[0]
        proba = float(np.max(proba_arr))
        # map probs to label names
        # model.classes_ holds integer labels used in training
        for idx, p in zip(_model.classes_, proba_arr):
            label_name = _inv_label_map.get(int(idx), str(idx))
            probs_map[label_name] = float(p)
    else:
        proba = 1.0
        probs_map[_inv_label_map.get(pred_idx, str(pred_idx))] = 1.0

    return {
        "timestamp": datetime.now().isoformat(),
        "ml_raw": _inv_label_map.get(pred_idx, str(pred_idx)),
        "ml_index": pred_idx,
        "ml_prob": proba,
        "probs": probs_map
    }
