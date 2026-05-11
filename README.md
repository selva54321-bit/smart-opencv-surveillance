# INTEC CCTV Intelligence Platform

A full-stack, AI-powered surveillance and facial recognition platform. This system utilizes a high-performance **FastAPI** backend with **InsightFace** and **FAISS** for real-time person tracking, alongside a beautiful, modern **React** dashboard for analytics, live feed monitoring, and administration.

![Dashboard Preview](CCTV-Dashboard/public/vite.svg) *(Replace with actual dashboard screenshot)*

## 🌟 Key Features
- **Real-Time Facial Recognition**: Utilizes InsightFace to extract deep learning face embeddings and matches them instantaneously using FAISS vector search.
- **Live Video Streaming**: Streams the camera feed directly to the browser (MJPEG) with live bounding boxes drawn natively by the backend.
- **Smart Tracking Logic**: Automatically calculates how long authorized/unauthorized/unknown individuals stay in the frame and tracks their entry/exit times.
- **Admin Enrollment UI**: Directly add new individuals to the database via the dashboard's "Add Person" page. The AI immediately reloads to recognize them.
- **Advanced Dashboard**: Features live charts, historical detection logs, and real-time statistics powered by React and Chart.js.

## 🏗️ Architecture Stack
- **Frontend**: React, Vite, React Router, Chart.js, Vanilla CSS.
- **Backend**: Python, FastAPI, Uvicorn, OpenCV (cv2).
- **AI/ML**: InsightFace (`buffalo_l` model), FAISS (Fast Vector Search), ONNX Runtime.
- **Database**: MongoDB (via `pymongo`) for storing user profiles, facial embeddings, and access logs.

---

## 🚀 Getting Started

### Prerequisites
Before running the project, ensure you have the following installed:
1. **Node.js** (v16+)
2. **Python** (v3.9+) & **Conda** (Recommended for managing ML dependencies)
3. **MongoDB**: Must be running locally on the default port (`mongodb://localhost:27017/`)
4. *(Optional but Highly Recommended)* **NVIDIA GPU** with CUDA Toolkit 12.x and cuDNN 9.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd intec-cctv
   ```
2. Create and activate a Conda environment:
   ```bash
   conda create -n cv python=3.10
   conda activate cv
   ```
3. Install the base requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. **(Optional) Enable GPU Acceleration**: 
   To significantly boost FPS, force InsightFace to use your NVIDIA GPU:
   ```bash
   # Uninstall CPU versions
   pip uninstall -y onnxruntime faiss-cpu
   
   # Install GPU versions
   pip install onnxruntime-gpu faiss-gpu
   
   # Install cuDNN (if you encounter missing .dll errors)
   conda install -c conda-forge cudnn
   ```
5. Run the backend server:
   ```bash
   python backend.py
   ```
   *The API will be available at `http://localhost:8000`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd CCTV-Dashboard
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `http://localhost:5173`.*

---

## ⚙️ Core API Endpoints

- `GET /api/live-stats`: Returns the current count and details of people actively standing in front of the camera.
- `GET /api/logs`: Returns the full historical log of detections, including roll numbers, statuses, and stay durations.
- `GET /api/video-feed`: An MJPEG stream endpoint that the React frontend renders as an `<img>` tag.
- `POST /api/enroll`: Accepts a `name`, `roll`, `is_authorized` flag, and an image file. Extracts the face embedding, saves it to MongoDB, and hot-reloads the FAISS index.

## 📁 Project Structure
```text
camrea/
├── CCTV-Dashboard/        # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components (Sidebar, MetricCards)
│   │   ├── pages/         # Dashboard Pages (Live Feed, Logs, Analytics, Enroll)
│   │   └── App.jsx        # Routing and global state (Data polling)
│   └── package.json
│
├── intec-cctv/            # FastAPI & AI Backend
│   ├── backend.py         # Main server, camera thread, and endpoints
│   ├── db.py              # (Legacy) JSON database logic
│   ├── live.py            # (Legacy) Local OpenCV script
│   └── requirements.txt
│
└── .gitignore             # Global gitignore configuration
```

## 🤝 Contributing
1. Ensure the MongoDB instance is active before testing changes to `backend.py`.
2. When modifying the frontend logic in `App.jsx`, avoid increasing the polling frequency to less than 2-3 seconds to prevent backend overload.
