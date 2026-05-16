from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2 as cv
import numpy as np
import insightface
import faiss
import threading
import time
from datetime import datetime
from pymongo import MongoClient
import uvicorn
from contextlib import asynccontextmanager
import os

# MongoDB setup
# The password 'Dinesh@63743' has the '@' symbol URL-encoded as '%40'
client = MongoClient("mongodb+srv://rdineshdinz12_db_user:Dinesh%4063743@facerecognition.53eagwn.mongodb.net/?appName=FaceRecognition")
db = client["cctv_db"]
people_col = db["people"]
logs_col = db["access_logs"]

# Initialize InsightFace
# Using CPUExecutionProvider as fallback if CUDA isn't available
# model = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
model = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider'])

model.prepare(ctx_id=-1, det_size=(640, 640))

# Global state
index = None
known_names = []
active_tracking = {}  # {name: {"last_seen": datetime, "log_id": ObjectId, "is_authorized": bool}}
pending_tracking = {} # {name: {"first_seen": datetime, "last_seen": datetime}}
tracking_lock = threading.Lock()
camera_running = False
current_frame = None

def reload_faiss():
    """Load all enrolled people from MongoDB into FAISS index for fast searching."""
    global index, known_names
    people = list(people_col.find())
    known_names = []
    embeddings = []
    
    for p in people:
        known_names.append({"name": p["name"], "is_authorized": p["is_authorized"], "roll": p.get("roll", "UNKNOWN")})
        embeddings.append(p["embedding"])
        
    if embeddings:
        embeddings_np = np.array(embeddings, dtype=np.float32)
        d = embeddings_np.shape[1]
        index = faiss.IndexFlatIP(d)
        index.add(embeddings_np)
        print(f"Loaded {len(embeddings)} profiles into FAISS.")
    else:
        index = None
        print("No profiles found in MongoDB. FAISS index empty.")

def get_face_embedding(img_np):
    """Extract a single face embedding from an image."""
    faces = model.get(img_np)
    if not faces:
        return None
    # Assuming the first detected face is the primary one
    embedding = faces[0].embedding.astype(np.float32).reshape(1, -1)
    embedding /= np.linalg.norm(embedding)  # Normalize
    return embedding[0]

def camera_loop():
    """Background thread to process the camera feed."""
    global active_tracking, camera_running, current_frame
    cap = cv.VideoCapture(0)
    
    while camera_running:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue
            
        resized_frame = cv.resize(frame, (640, 480))
        now = datetime.now()
        
        faces = model.get(resized_frame)
        
        if faces and index is not None:
            for face in faces:
                bbox = face.bbox.astype(int)
                embedding = face.embedding.astype(np.float32).reshape(1, -1)
                embedding /= np.linalg.norm(embedding)
                
                distances, indices = index.search(embedding, k=1)
                
                matched_name = "Unknown"
                matched_roll = "UNKNOWN"
                type_str = "unknown"
                color = (0, 0, 255) # Red for unknown
                
                if distances[0][0] > 0.5:
                    matched_person = known_names[indices[0][0]]
                    matched_name = matched_person["name"]
                    matched_roll = matched_person["roll"]
                    is_auth = matched_person["is_authorized"]
                    type_str = "authorized" if is_auth else "unauthorized"
                    color = (0, 255, 0) if is_auth else (0, 165, 255) # Green if auth, Orange if not
                    
                    with tracking_lock:
                        if matched_name not in active_tracking:
                            # New entry
                            log_entry = {
                                "name": matched_name,
                                "roll": matched_roll,
                                "type": type_str,
                                "venue": "Main Gate",
                                "camera": "CAM-01",
                                "confidence": float(distances[0][0]),
                                "entry_time": now,
                                "exit_time": None,
                                "duration_minutes": 0.0,
                                "status": "active"
                            }
                            result = logs_col.insert_one(log_entry)
                            active_tracking[matched_name] = {
                                "last_seen": now,
                                "log_id": result.inserted_id,
                                "is_authorized": is_auth
                            }
                        else:
                            active_tracking[matched_name]["last_seen"] = now
                else:
                    # Log unknown person if seen for more than 15 seconds
                    with tracking_lock:
                        if "Unknown" not in pending_tracking:
                            pending_tracking["Unknown"] = {"first_seen": now, "last_seen": now}
                        else:
                            pending_tracking["Unknown"]["last_seen"] = now
                            time_visible = (now - pending_tracking["Unknown"]["first_seen"]).total_seconds()
                            if time_visible >= 15:
                                if "Unknown" not in active_tracking:
                                    log_entry = {
                                        "name": "Unknown",
                                        "roll": "UNKNOWN",
                                        "type": "unknown",
                                        "venue": "Main Gate",
                                        "camera": "CAM-01",
                                        "confidence": float(distances[0][0]),
                                        "entry_time": pending_tracking["Unknown"]["first_seen"],
                                        "exit_time": None,
                                        "duration_minutes": 0.0,
                                        "status": "active"
                                    }
                                    result = logs_col.insert_one(log_entry)
                                    active_tracking["Unknown"] = {
                                        "last_seen": now,
                                        "log_id": result.inserted_id,
                                        "is_authorized": False
                                    }
                                else:
                                    active_tracking["Unknown"]["last_seen"] = now

                # Draw bounding box
                cv.rectangle(resized_frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                cv.putText(resized_frame, f"{matched_name} ({distances[0][0]:.2f})", (bbox[0], bbox[1] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # Cleanup old sessions (not seen for 60 seconds)
        with tracking_lock:
            to_remove = []
            for name, data in active_tracking.items():
                if (now - data["last_seen"]).total_seconds() > 60:
                    to_remove.append(name)
                    
            for name in to_remove:
                data = active_tracking.pop(name)
                # Calculate duration
                log_doc = logs_col.find_one({"_id": data["log_id"]})
                if log_doc:
                    entry_time = log_doc["entry_time"]
                    duration_minutes = (data["last_seen"] - entry_time).total_seconds() / 60.0
                    logs_col.update_one(
                        {"_id": data["log_id"]},
                        {"$set": {
                            "exit_time": data["last_seen"],
                            "duration_minutes": round(duration_minutes, 2),
                            "status": "completed"
                        }}
                    )

            # Cleanup pending tracking if not seen for 5 seconds
            to_remove_pending = []
            for name, data in pending_tracking.items():
                if (now - data["last_seen"]).total_seconds() > 5:
                    to_remove_pending.append(name)
            for name in to_remove_pending:
                del pending_tracking[name]

        current_frame = resized_frame
        time.sleep(0.03) # ~30 FPS

    cap.release()

app = FastAPI(title="CCTV Face Recognition API")

# Add CORS middleware to allow the Vite frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use lifespan events
@app.on_event("startup")
def startup_event():
    global camera_running
    
    # Clean up any orphaned 'active' logs from a previous server crash/shutdown
    orphans = logs_col.find({"status": "active"})
    for orphan in orphans:
        logs_col.update_one(
            {"_id": orphan["_id"]},
            {"$set": {
                "exit_time": orphan["entry_time"],
                "status": "completed"
            }}
        )
        
    reload_faiss()
    camera_running = True
    thread = threading.Thread(target=camera_loop, daemon=True)
    thread.start()

@app.on_event("shutdown")
def shutdown_event():
    global camera_running
    camera_running = False

@app.post("/api/enroll")
async def enroll_person(name: str = Form(...), roll: str = Form(...), is_authorized: bool = Form(True), file: UploadFile = File(...)):
    """Admin endpoint to enroll a new person via face scan."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_np = cv.imdecode(nparr, cv.IMREAD_COLOR)
    
    if img_np is None:
        return {"error": "Invalid image file."}
        
    embedding = get_face_embedding(img_np)
    if embedding is None:
        return {"error": "No face detected in the provided image."}
        
    person_doc = {
        "name": name,
        "roll": roll,
        "is_authorized": is_authorized,
        "embedding": embedding.tolist(),
        "created_at": datetime.now()
    }
    
    # Allow re-enrollment by overwriting old data for the same name
    people_col.delete_many({"name": name})
    people_col.insert_one(person_doc)
    
    # Reload the FAISS index to include the new person immediately
    reload_faiss()
    return {"success": True, "message": f"Successfully enrolled {name}"}

@app.get("/api/live-stats")
def live_stats():
    """Get currently active people in the room."""
    with tracking_lock:
        active_list = []
        for name, data in active_tracking.items():
            active_list.append({
                "name": name,
                "is_authorized": data["is_authorized"],
                "last_seen": data["last_seen"].isoformat()
            })
            
    return {
        "people_count": len(active_list),
        "active_people": active_list
    }

@app.get("/api/logs")
def get_logs(limit: int = 250):
    """Get historical access logs (who entered, when, and for how long). Formatted for React dashboard."""
    db_logs = list(logs_col.find().sort("entry_time", -1).limit(limit))
    frontend_logs = []
    
    for log in db_logs:
        entry_time = log.get("entry_time")
        if not entry_time: continue
        
        frontend_logs.append({
            "id": str(log["_id"]),
            "roll": log.get("roll", "UNKNOWN"),
            "name": log.get("name", "Unknown"),
            "venue": log.get("venue", "Main Gate"),
            "camera": log.get("camera", "CAM-01"),
            "confidence": log.get("confidence", 0.95),
            "type": log.get("type", "authorized"),
            "time": entry_time.strftime("%I:%M:%S %p"),
            "ts": int(entry_time.timestamp() * 1000),
            "duration": log.get("duration_minutes", 0.0),
            "status": log.get("status", "active")
        })
            
    return {"logs": frontend_logs}

def generate_video_feed():
    """Generator for streaming the MJPEG video feed."""
    while True:
        if current_frame is not None:
            ret, buffer = cv.imencode('.jpg', current_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            time.sleep(0.1)

@app.get("/api/video-feed")
def video_feed():
    """Stream the live camera feed with drawn bounding boxes."""
    return StreamingResponse(generate_video_feed(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)






