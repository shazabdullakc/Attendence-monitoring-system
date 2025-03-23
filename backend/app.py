from flask import Flask, request, jsonify, render_template
from deepface import DeepFace
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import cv2 as cv
import base64
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    embedding = db.Column(db.Text, nullable=False)
    
with app.app_context():
    db.create_all()

def get_face_embedding(image):
    try:
        embedding = DeepFace.represent(image, model_name="Facenet")[0]["embedding"]
        return embedding
    except:
        return None

@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in students])
    
@app.route('/api/add_student', methods=['POST'])
def add_student():
    data = request.json
    name = data['name']
    image = data['image']
    if not name or not image:
        return jsonify({"message": "Name and image required"}), 400
    
    # Remove data:image/jpeg;base64, prefix if present
    if ',' in image:
        image = image.split(',')[1]
    
    image_bytes = base64.b64decode(image)
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv.imdecode(np_array, cv.IMREAD_COLOR)
    
    embedding = get_face_embedding(image)
    if embedding is None:
        return jsonify({"error": "Face not detected"}), 400
    
    if embedding:
        new_student = Student(name=name, embedding=json.dumps(embedding))
        db.session.add(new_student)
        db.session.commit()
        return jsonify({"message": "Student added successfully", "id": new_student.id})
    else:
        return jsonify({"message": "Error adding student"}), 400
    
@app.route("/api/recognize", methods=["POST"])
def recognize_face():
    data = request.json
    image_data = data.get("image")

    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    # Remove data:image/jpeg;base64, prefix if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    # Decode Base64 image
    image_bytes = base64.b64decode(image_data)
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv.imdecode(np_array, cv.IMREAD_COLOR)

    # Extract face embedding
    live_embedding = get_face_embedding(image)
    if live_embedding is None:
        return jsonify({"error": "Face not detected"}), 400

    # Compare with database embeddings
    students = Student.query.all()
    for student in students:
        stored_embedding = json.loads(student.embedding)
        distance = np.linalg.norm(np.array(stored_embedding) - np.array(live_embedding))
        if distance < 10:  # Similarity threshold
            return jsonify({"message": f"Recognized as {student.name}", "name": student.name, "id": student.id})

    return jsonify({"error": "Face not recognized"}), 400

if __name__ == "__main__":
    app.run(debug=True)
