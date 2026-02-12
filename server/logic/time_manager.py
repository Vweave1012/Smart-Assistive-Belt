import time
import json
import os

class TimeManager:
    def __init__(self, state_file='server/logic/state.json'):
        # 1. Store the file path and define thresholds
        self.state_file = state_file
        self.HUNGER_THRESHOLD = 4 * 3600  # 4 hours
        self.TOILET_THRESHOLD = 3 * 3600  # 3 hours

        # 2. Set default values in case the file is missing
        self.last_meal_time = time.time()
        self.last_toilet_time = time.time()
        
        # 3. Load previous data from state.json
        self.load_state()

    def load_state(self):
        """Reads timestamps from the JSON file if it exists."""
        if os.path.exists(self.state_file) and os.path.getsize(self.state_file) > 0:
            try:
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    self.last_meal_time = data.get("last_meal_time", time.time())
                    self.last_toilet_time = data.get("last_toilet_time", time.time())
            except Exception as e:
                print(f"Error loading state.json: {e}")

    def save_state(self):
        """Writes current timestamps to the JSON file."""
        data = {
            "last_meal_time": self.last_meal_time,
            "last_toilet_time": self.last_toilet_time
        }
        with open(self.state_file, 'w') as f:
            json.dump(data, f, indent=4)

    def update_meal_time(self):
        """Updates the timer and saves to JSON."""
        self.last_meal_time = time.time()
        self.save_state()

    def update_toilet_time(self):
        """Updates the timer and saves to JSON."""
        self.last_toilet_time = time.time()
        self.save_state()

    def get_time_stats(self):
        now = time.time()
        tslm = now - self.last_meal_time
        tslu = now - self.last_toilet_time
        return tslm, tslu

    def evaluate_context(self, physical_state):
        tslm, tslu = self.get_time_stats()
        
        if physical_state in ["RESTLESS", "HIGHLY_RESTLESS"]:
            if tslm > self.HUNGER_THRESHOLD:
                return "POTENTIAL_HUNGER"
            if tslu > self.TOILET_THRESHOLD:
                return "POTENTIAL_TOILET_NEED"
        
        return physical_state