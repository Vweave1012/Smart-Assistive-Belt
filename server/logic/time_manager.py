import time

class TimeManager:
    def __init__(self):
        # Initializing with the current time as a starting point
        self.last_meal_time = time.time()
        self.last_toilet_time = time.time()
        
        # Thresholds (in seconds) - Adjust these based on user needs
        self.HUNGER_THRESHOLD = 4 * 3600  # 4 hours
        self.TOILET_THRESHOLD = 3 * 3600  # 3 hours

    def update_meal_time(self):
        """Called when caregiver inputs a one-time meal event."""
        self.last_meal_time = time.time()

    def update_toilet_time(self):
        """Called when caregiver inputs a one-time toilet event."""
        self.last_toilet_time = time.time()

    def get_time_stats(self):
        """Calculates seconds elapsed since last events."""
        now = time.time()
        tslm = now - self.last_meal_time
        tslu = now - self.last_toilet_time
        return tslm, tslu

    def evaluate_context(self, physical_state):
        """Combines ML physical state with time logic."""
        tslm, tslu = self.get_time_stats()
        
        # If ML detects RESTLESS/HIGHLY_RESTLESS, we check the clock
        if physical_state in ["RESTLESS", "HIGHLY_RESTLESS"]:
            if tslm > self.HUNGER_THRESHOLD:
                return "POTENTIAL_HUNGER"
            if tslu > self.TOILET_THRESHOLD:
                return "POTENTIAL_TOILET_NEED"
        
        return physical_state