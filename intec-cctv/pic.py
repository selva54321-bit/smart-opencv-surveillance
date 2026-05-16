import cv2 as cv
import numpy as np
import os
import faiss
import insightface
import matplotlib.pyplot as plt
import numpy as np
import cv2 as cv
import os
import insightface
import pickle
from pathlib import Path
import matplotlib.pyplot as plt

class FACELOADING:
    """
    A class for loading and processing face images using InsightFace face detection.
    This class handles loading images from a directory structure, detecting faces,
    and storing their embeddings for face recognition.
    """
    
    def __init__(self, directory):
        """
        Initialize the FACELOADING class.
        
        Args:
            directory (str): Root directory containing subdirectories of face images
        """
        self.directory = directory
        self.X = []  # Will store face embeddings
        self.Y = []  # Will store corresponding labels
        # Initialize InsightFace buffalo_l model
        self.model = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CUDAExecutionProvider'])
        self.model.prepare(ctx_id=0, det_size=(640, 640))

    def extract_face(self, filename):
        """
        Extract face embeddings from a single image using InsightFace.
        
        Args:
            filename (str): Path to the image file
            
        Returns:
            numpy.ndarray: Face embeddings or None if no face detected
        """
        try:
            # Read and convert image to RGB
            img = cv.imread(filename)
            if img is None:
                print(f"Could not read image: {filename}")
                return None
                
            img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
            
            # Perform face detection and get embeddings
            faces = self.model.get(img)
            
            if not faces:
                print(f"No face detected in {filename}")
                return None
                
            # Get embeddings from the first detected face
            embeddings = faces[0].embedding
            # Normalize embeddings
            embeddings = embeddings / np.linalg.norm(embeddings)
            
            return embeddings
            
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            return None

    def load_faces(self, dir):
        """
        Load all faces from a directory.
        
        Args:
            dir (str): Directory containing face images
            
        Returns:
            list: List of face embeddings
        """
        faces = []
        for im_name in os.listdir(dir):
            if im_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                path = os.path.join(dir, im_name)
                embeddings = self.extract_face(path)
                if embeddings is not None:
                    faces.append(embeddings)
        return faces

    def load_classes(self):
        """
        Load all classes (subjects) from the main directory.
        Each subdirectory name is treated as a class label.
        
        Returns:
            tuple: (numpy.ndarray of face embeddings, numpy.ndarray of labels)
        """
        self.X = []
        self.Y = []
        
        for sub_dir in os.listdir(self.directory):
            path = os.path.join(self.directory, sub_dir)
            if os.path.isdir(path):
                faces = self.load_faces(path)
                if faces:
                    self.X.extend(faces)
                    self.Y.extend([sub_dir] * len(faces))
                    print(f"Loaded {len(faces)} embeddings for subject: {sub_dir}")
        
        return np.array(self.X), np.array(self.Y)
face_loading=FACELOADING('Images')
X,Y=face_loading.load_classes()
import faiss
# Setup FAISS IndexFlatIP
d = X.shape[1]
index = faiss.IndexFlatIP(d)
# Add data to FAISS index
if len(X) > 0:
    index.add(X)
faiss.write_index(index,'face_index.faiss')      
data={
    'labels':Y
}
with open('labels.pkl','wb') as f:
    pickle.dump(data,f)
