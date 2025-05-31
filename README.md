# Attendance Monitoring System

A modern face recognition-based attendance monitoring system built with Flask and Angular.

## Project Overview

This is a comprehensive attendance monitoring system that utilizes facial recognition technology to track student attendance. The system consists of two main components:

1. Backend (Flask API)
2. Frontend (Angular Application)

## Features

- Face recognition for attendance marking
- Student management system
- Real-time attendance tracking
- Historical attendance records
- Modern and user-friendly interface
- Secure API endpoints

## Tech Stack

### Backend
- Python 3.x
- Flask (Web Framework)
- SQLAlchemy (ORM)
- DeepFace (Face Recognition)
- SQLite (Database)
- Flask-CORS (Cross-Origin Resource Sharing)

### Frontend
- Angular 15
- Angular Material (UI Components)
- RxJS (Reactive Programming)
- TypeScript

## Project Structure

```
attendance-system/
├── backend/           # Flask backend server
├── frontend/          # Angular frontend application
├── instance/          # Flask instance folder
├── logs/             # Application logs
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16.x or higher
- npm (Node Package Manager)

### Installation

1. Clone the repository
2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend/attendance-frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python app.py
```

2. Start the frontend development server:
```bash
cd frontend/attendance-frontend
ng serve
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## API Endpoints

- `GET /students` - Get all students
- `POST /students` - Add new student
- `POST /recognize` - Face recognition endpoint
- `GET /attendance` - Get attendance records

## Database

The system uses SQLite as its database. The database schema includes:

- Students table: Stores student information and face embeddings
- Attendance table: Stores attendance records with timestamps

## Logging

The application logs are stored in the `logs` directory with daily rotation.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
