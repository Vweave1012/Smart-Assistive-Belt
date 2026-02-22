import json
import os
from datetime import datetime

# ================= FILE PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # server/
STATE_FILE = os.path.join(BASE_DIR, "logic", "state.json")


# ================= CLINICAL THRESHOLDS (minutes) =================
# Realistic caregiving intervals
HUNGER_MINUTES = 0.1   # 3 hours
PEE_MINUTES = 0.15       # 1 hour
POOP_MINUTES = 0.2       # 6 hours


# ================= STATE FILE HANDLING =================
def _ensure_state_file():
    """Create state.json if missing."""
    if not os.path.exists(STATE_FILE):
        state = {
            "last_meal": None,
            "last_pee": None,
            "last_poop": None
        }
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)


def load_state():
    _ensure_state_file()
    with open(STATE_FILE, "r") as f:
        return json.load(f)


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# ================= TIME CALCULATION =================
def minutes_since(timestamp_str):
    """Return minutes since given ISO timestamp."""
    if timestamp_str is None:
        return float("inf")

    try:
        last_time = datetime.fromisoformat(timestamp_str)
    except Exception:
        return float("inf")

    return (datetime.now() - last_time).total_seconds() / 60.0


def get_time_metrics():
    """
    Returns:
        tslm → minutes since last meal
        tslu → minutes since last pee
        tslb → minutes since last poop
    """
    state = load_state()

    tslm = minutes_since(state.get("last_meal"))
    tslu = minutes_since(state.get("last_pee"))
    tslb = minutes_since(state.get("last_poop"))

    return tslm, tslu, tslb


def apply_time_logic(ml_state, fsr_pct):
    """MODIFIED FOR DEMO: Bypasses time checks for instant alerts."""
    try:
        fsr = float(fsr_pct)
    except Exception:
        fsr = 0.0

    # Ensure belt is worn
    if fsr < 5:
        return "NO_USER"

    # TRIGGER ALERTS IMMEDIATELY
    if ml_state == "HUNGER":
        return "POTENTIAL_HUNGER"
    if ml_state == "PEE":
        return "POTENTIAL_PEE"
    if ml_state == "POOP":
        return "POTENTIAL_POOP"

    return "NORMAL"

    # # ---------- LOAD TIME METRICS ----------
    # tslm, tslu, tslb = get_time_metrics()

    # # ---------- HUNGER ----------
    
    # if tslm >= HUNGER_MINUTES:
    #     return "POTENTIAL_HUNGER"   # urgent hunger alert
    # return "HUNGER"                 # mild indication

    # # ---------- PEE ----------
   
    # if tslu >= PEE_MINUTES:
    #     return "POTENTIAL_PEE"      # urgent bathroom alert
    # return "PEE"

    # # ---------- POOP ----------
    
    # if tslb >= POOP_MINUTES:
    #     return "POTENTIAL_POOP"     # urgent bowel alert
    # return "POOP"

    # if ml_state in["Hunger","PEE","POOP"]:
    #     return ml_state
    # # ---------- DEFAULT ----------
    # return "NORMAL"


# ================= TIMER UPDATE (RESET HANDLER) =================
def update_event(final_state):
    """
    Update timestamps when caregiver CONFIRMS event.

    Accepts:
        HUNGER / PEE / POOP
        POTENTIAL_HUNGER / POTENTIAL_PEE / POTENTIAL_POOP
    """

    if not isinstance(final_state, str):
        return load_state()

    # Remove POTENTIAL_ prefix if present
    normalized = final_state.replace("POTENTIAL_", "").upper()

    state = load_state()
    now = datetime.now().isoformat()

    if normalized == "HUNGER":
        state["last_meal"] = now

    elif normalized == "PEE":
        state["last_pee"] = now

    elif normalized == "POOP":
        state["last_poop"] = now

    save_state(state)
    return state
