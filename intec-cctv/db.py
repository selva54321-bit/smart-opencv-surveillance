import json
import os
from datetime import datetime

class FaceDBLoggerJSON:
    def __init__(self, db_file="face_db.json"):
        self.db_file = db_file
        self.last_detection_times = {}
        self.init_table()

    def init_table(self):
        """Create the JSON file if it doesn't exist."""
        if not os.path.exists(self.db_file):
            with open(self.db_file, "w") as f:
                json.dump({"detections": []}, f, indent=4)

    def _load_data(self):
        with open(self.db_file, "r") as f:
            return json.load(f)

    def _save_data(self, data):
        with open(self.db_file, "w") as f:
            json.dump(data, f, indent=4)

    def log_detection(self, name, confidence, camera):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        data = self._load_data()
        # Simulate an auto-increment ID
        new_id = (data["detections"][-1]["id"] + 1) if data["detections"] else 1

        detection_entry = {
            "id": new_id,
            "roll_no": name,
            "confidence": confidence,
            "timestamp": timestamp,
            "camera": camera
        }

        data["detections"].append(detection_entry)
        self._save_data(data)

    def should_log_detection(self, name):
        now = datetime.now()

        if name not in self.last_detection_times:
            self.last_detection_times[name] = now
            return True

        last_seen = self.last_detection_times[name]
        if (now - last_seen).total_seconds() >= 5:
            self.last_detection_times[name] = now
            return True

        return False

    def close(self):
        """Nothing special needed for JSON."""
        pass
