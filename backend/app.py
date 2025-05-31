from flask import Flask, request, jsonify, render_template
from deepface import DeepFace
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import cv2 as cv
import base64
import numpy as np
import logging
import os
from datetime import datetime

# Configure logging
log_directory = 'logs'
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_directory, f'attendance_{datetime.now().strftime("%Y%m%d")}.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    embedding = db.Column(db.Text, nullable=False)
    attendances = db.relationship('Attendance', backref='student', lazy=True)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    
with app.app_context():
    db.create_all()
    logger.info("Database initialized successfully")

def get_face_embedding(image):
    try:
        logger.debug("Attempting to get face embedding")
        embedding = DeepFace.represent(image, model_name="Facenet")[0]["embedding"]
        logger.debug("Face embedding generated successfully")
        return embedding
    except Exception as e:
        logger.error(f"Error getting face embedding: {str(e)}")
        return None

@app.route('/api/students', methods=['GET'])
def get_students():
    logger.info("Fetching all students")
    try:
        students = Student.query.all()
        student_count = len(students)
        logger.info(f"Successfully retrieved {student_count} students")
        return jsonify([{"id": s.id, "name": s.name} for s in students])
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/api/add_student', methods=['POST'])
def add_student():
    logger.info("Received request to add new student")
    try:
        name = request.form.get('name')
        image_file = request.files.get('image')
        
        if not name or not image_file:
            logger.warning("Missing required fields (name or image)")
            return jsonify({"message": "Name and image required"}), 400
        
        logger.debug(f"Processing registration for student: {name}")
        
        # Read the image file
        image_bytes = image_file.read()
        np_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv.imdecode(np_array, cv.IMREAD_COLOR)
        
        embedding = get_face_embedding(image)
        if embedding is None:
            logger.warning(f"Face not detected for student: {name}")
            return jsonify({"error": "Face not detected"}), 400
        
        new_student = Student(name=name, embedding=json.dumps(embedding))
        db.session.add(new_student)
        db.session.commit()
        logger.info(f"Successfully registered student: {name} (ID: {new_student.id})")
        return jsonify({"message": "Student added successfully", "id": new_student.id})
        
    except Exception as e:
        logger.error(f"Error adding student: {str(e)}")
        return jsonify({"message": "Error adding student"}), 400
    
@app.route("/api/recognize", methods=["POST"])
def recognize_face():
    logger.info("Received face recognition request")
    try:
        data = request.json
        image_data = data.get("image")

        if not image_data:
            logger.warning("No image provided for recognition")
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
            logger.warning("Face not detected in recognition attempt")
            return jsonify({"error": "Face not detected"}), 400

        # Compare with database embeddings
        students = Student.query.all()
        logger.debug(f"Comparing face with {len(students)} stored faces")
        
        for student in students:
            stored_embedding = json.loads(student.embedding)
            distance = np.linalg.norm(np.array(stored_embedding) - np.array(live_embedding))
            if distance < 10:  # Similarity threshold
                new_attendance = Attendance(student_id=student.id)
                db.session.add(new_attendance)
                db.session.commit()
                logger.info(f"Face recognized as student: {student.name} (ID: {student.id})")
                return jsonify({"message": f"Recognized as {student.name}", "name": student.name, "id": student.id})

        logger.warning("Face not recognized in database")
        return jsonify({"error": "Face not recognized"}), 400
        
    except Exception as e:
        logger.error(f"Error during face recognition: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    logger.info("Fetching attendance records")
    try:
        # Using SQL subquery to get the latest attendance for each student
        # This is more efficient than fetching all records and filtering in Python
        latest_attendance_subquery = db.session.query(
            Attendance.student_id,
            db.func.max(Attendance.timestamp).label('latest_timestamp')
        ).group_by(Attendance.student_id).subquery()
        
        # Join the subquery with the Student and Attendance tables
        results = db.session.query(
            Student.id,
            Student.name,
            latest_attendance_subquery.c.latest_timestamp
        ).outerjoin(
            latest_attendance_subquery,
            Student.id == latest_attendance_subquery.c.student_id
        ).all()
        
        attendance_list = []
        for id, name, timestamp in results:
            attendance_list.append({
                "id": id,
                "name": name,
                "lastAttendance": timestamp.isoformat() if timestamp else None
            })
        
        logger.info(f"Successfully retrieved attendance records for {len(attendance_list)} students")
        return jsonify(attendance_list)
    except Exception as e:
        logger.error(f"Error fetching attendance records: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    logger.info("Starting attendance system server")
    app.run(debug=True)
