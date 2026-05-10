import gradio as gr
import cv2 as cv
import numpy as np
import insightface
import faiss
import pickle
import time
import threading
from queue import Queue
from db import FaceDBLoggerJSON
import json
from datetime import datetime

model = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider'])
model.prepare(ctx_id=-1, det_size=(640, 640))

# Initialize db
database = FaceDBLoggerJSON(db_file="face_db.json")

# Load embeddings and labels
with open('labels.pkl', 'rb') as f:
    data = pickle.load(f)
    Y = data['labels']

# Setup FAISS IndexFlatIP
index = faiss.read_index('face_index.faiss')

# Global variables
camera_active = False
camera_thread = None
current_frame = None
frame_lock = threading.Lock()
stats = {"fps": 0, "detections": 0, "last_person": "None"}

def draw_label(img, text, pos, color, scale=0.7, thickness=2):
    """Improved text rendering for readability."""
    cv.putText(img, text, pos, cv.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), thickness * 3)
    cv.putText(img, text, pos, cv.FONT_HERSHEY_SIMPLEX, scale, color, thickness)

def process_camera(camera_source):
    """Process camera feed in background thread."""
    global camera_active, current_frame, stats
    
    cap = cv.VideoCapture(camera_source)
    frame_times = []
    
    while camera_active:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Resize frame
        resized_frame = cv.resize(frame, (640, 480))
        current_time = time.time()
        
        # Calculate FPS
        frame_times.append(current_time)
        frame_times = [t for t in frame_times if t > current_time - 1]
        fps = len(frame_times)
        
        # Face detection
        faces = model.get(resized_frame)
        detection_count = 0
        last_detected = "None"
        
        if faces:
            embeddings = []
            face_data = []
            
            for face in faces:
                bbox = face.bbox.astype(int)
                embedding = face.embedding.astype(np.float32).reshape(1, -1)
                embedding /= np.linalg.norm(embedding)
                embeddings.append(embedding[0])
                face_data.append((face, bbox))
            
            if embeddings:
                embeddings = np.array(embeddings, dtype=np.float32)
                distances, indices = index.search(embeddings, k=1)
                
                for (face, bbox), distance, idx in zip(face_data, distances, indices):
                    matched_name = Y[idx[0]] if distance[0] > 0.5 else "Unknown"
                    color = (0, 255, 0) if matched_name != "Unknown" else (0, 0, 255)
                    
                    # Draw bounding box and label
                    cv.rectangle(resized_frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                    label = f"{matched_name} ({distance[0]:.2f})"
                    draw_label(resized_frame, label, (bbox[0], bbox[1] - 10), color)
                    
                    detection_count += 1
                    last_detected = matched_name
                    
                    # Log to database
                    if distance[0] > 0.5 and database.should_log_detection(matched_name):
                        database.log_detection(matched_name, float(distance[0]), camera_source)
        
        # Display FPS
        fps_text = f"FPS: {fps} | Detections: {detection_count}"
        draw_label(resized_frame, fps_text, (10, 30), (0, 255, 0))
        
        # Update stats
        stats = {
            "fps": fps,
            "detections": detection_count,
            "last_person": last_detected
        }
        
        # Convert BGR to RGB for Gradio
        with frame_lock:
            current_frame = cv.cvtColor(resized_frame, cv.COLOR_BGR2RGB)
        
        time.sleep(0.03)  # ~30 FPS
    
    cap.release()

def start_camera(camera_source):
    """Start camera processing."""
    global camera_active, camera_thread
    
    if camera_active:
        return "Camera already running!"
    
    # Convert camera source to int if it's a number
    try:
        camera_source = int(camera_source)
    except ValueError:
        pass  # Keep as string (URL)
    
    camera_active = True
    camera_thread = threading.Thread(target=process_camera, args=(camera_source,), daemon=True)
    camera_thread.start()
    
    return "✅ Camera started successfully!"

def stop_camera():
    """Stop camera processing."""
    global camera_active, current_frame
    
    camera_active = False
    if camera_thread:
        camera_thread.join(timeout=2.0)
    
    with frame_lock:
        current_frame = None
    
    return "⏹️ Camera stopped!"

def video_stream():
    """Generator function for video streaming."""
    while True:
        with frame_lock:
            if current_frame is not None:
                yield current_frame
            else:
                # Return blank frame
                blank = np.zeros((480, 640, 3), dtype=np.uint8)
                cv.putText(blank, "No camera feed", (200, 240), 
                          cv.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                yield blank
        time.sleep(0.033)  # ~30 FPS

def get_stats():
    """Get current statistics."""
    return f"📊 FPS: {stats['fps']} | 👤 Detections: {stats['detections']} | 🎯 Last: {stats['last_person']}"

def get_recent_logs(n=10):
    """Get recent detection logs."""
    try:
        with open("face_db.json", "r") as f:
            data = json.load(f)
            detections = data.get("detections", [])
            recent = detections[-n:][::-1]  # Get last n, reverse order
            
            if not recent:
                return "No detections logged yet."
            
            log_text = ""
            for det in recent:
                log_text += f"ID: {det['id']} | {det['roll_no']} | Conf: {det['confidence']:.2f} | "
                log_text += f"Time: {det['timestamp']} | Camera: {det['camera']}\n"
            
            return log_text
    except Exception as e:
        return f"Error reading logs: {str(e)}"

# Create Gradio interface
with gr.Blocks(title="Face Recognition System", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🎥 Real-Time Face Recognition System")
    gr.Markdown("Monitor live camera feeds with face detection and recognition using InsightFace + FAISS")
    
    with gr.Row():
        with gr.Column(scale=2):
            # Video feed
            video_output = gr.Image(label="Live Camera Feed", streaming=True)
            stats_display = gr.Textbox(label="Statistics", value="Waiting to start...", interactive=False)
        
        with gr.Column(scale=1):
            # Controls
            gr.Markdown("### 🎛️ Camera Controls")
            camera_input = gr.Textbox(label="Camera Source", value="0", 
                                     placeholder="0 for webcam or RTSP URL")
            
            with gr.Row():
                start_btn = gr.Button("▶️ Start Camera", variant="primary")
                stop_btn = gr.Button("⏹️ Stop Camera", variant="stop")
            
            status_output = gr.Textbox(label="Status", interactive=False)
            
            gr.Markdown("### 📊 Detection Logs")
            logs_display = gr.Textbox(label="Recent Detections", lines=10, interactive=False)
            refresh_btn = gr.Button("🔄 Refresh Logs")
    
    # Event handlers
    start_btn.click(
        fn=start_camera,
        inputs=camera_input,
        outputs=status_output
    )
    
    stop_btn.click(
        fn=stop_camera,
        outputs=status_output
    )
    
    refresh_btn.click(
        fn=get_recent_logs,
        outputs=logs_display
    )
    
    # Use demo.load with streaming video
    demo.load(
        fn=video_stream,
        inputs=None,
        outputs=video_output,
    )
    
    # Auto-update stats every 500ms
    stats_timer = gr.Timer(0.5)
    stats_timer.tick(
        fn=get_stats,
        outputs=stats_display
    )
    
    # Auto-refresh logs every 5 seconds
    logs_timer = gr.Timer(5)
    logs_timer.tick(
        fn=get_recent_logs,
        outputs=logs_display
    )

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )
