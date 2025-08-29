import io
import base64
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import torch
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)

# Load the custom YOLOv11 model
model = YOLO('models/best.onnx') # local model
# model = YOLO('yolov8n.pt')  # pretrained model

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webm'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file and allowed_file(file.filename):
        # Read image from in-memory buffer
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Perform inference
        results = model(img)

        # Get the annotated image
        annotated_image = results[0].plot()

        # Encode the annotated image to JPEG format in memory
        _, buffer = cv2.imencode('.jpg', annotated_image)
        
        # Convert buffer to a base64 string
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({'annotated_image': f'data:image/jpeg;base64,{encoded_image}'})

    return jsonify({'error': 'File type not allowed'})


if __name__ == '__main__':
    app.run(debug=True)
