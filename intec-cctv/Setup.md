#Setup Guide
##1. Requirements

-Python 3.10+
-pip
-(Optional) NVIDIA GPU with CUDA for faster training
-Works on CPU as well (slower)

##2. Install Python 3.10+

Check your version:

```bash
python --version
```

##3. Create Virtual Environment

Create a virtual environment:
```bash
python -m venv venv
```

##4. Activate Virtual Environment
Windows:
```bash
venv\Scripts\activate
```
Linux / macOS:
```bash
source venv/bin/activate
```

After activation, your terminal should show:
```bash
(venv)
```

##5. Install Dependencies

```bash
pip install -r requirements.txt
```
##GPU Note
This project was developed in a GPU environment.
If you have NVIDIA GPU:
```python
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118(according to your cuda version)
```

For FAISS:
CPU version:
```python
pip install faiss-cpu
```
GPU version:
```python
pip install faiss-gpu
```
##6. Dataset Structure
Place images inside the Images/ directory using this structure:
```
Images/
    person_name/
        img1.jpg
        img2.jpg
    another_person/
        img1.jpg
```
###Important:
- Folder name = person label
- Add multiple photos
- Include different angles & lighting conditions for better recognition

##7. Training
Open:
`training.ipynb`
Run all cells.
After successful training, these files will be generated:
`labels.pkl`
`face_index.faiss`
These files are required for recognition.

##8. Live Recognition
Run:
```bash
python live.py
```
This will:
- Start webcam
- Detect faces
- Recognize trained people
- Display results live
- Log in DB

##9. Run API
Start API server:
```bash
python app.py
```
This exposes face recognition functionality as an API service.
You can integrate it with:
- Web apps
- Mobile apps
- External services

##10. Database
`db.py` contains database logic
Results are stored in:
`face_db.json`
You can replace JSON storage with:
- MySQL
- PostgreSQL
- MongoDB
- Firebase
- Any other DB

If replacing DB:
- Maintain same function names
- Maintain same function parameters
- Update logic inside functions only

##Project Flow Summary
1. Place images in Images/
2. Run training.ipynb
3. Generate:
- labels.pkl
- face_index.faiss
4. Run:
- live.py (for webcam recognition)
- app.py (for API usage)