# SmartRecord

DS-powered student record system — Trie, HashMap, BST from scratch. React + FastAPI + SQLite.

## 🔗 Live Demo
- Frontend: https://smart-record-student-record-system.vercel.app
- Backend API: https://smartrecord-student-record-system.onrender.com/docs

## Data Structures
- **Trie** — name-based autocomplete search
- **HashMap** — O(1) lookup by roll number
- **BST** — alphabetically sorted student listing

## Tech Stack
- Frontend: React + Vite
- Backend: Python + FastAPI
- Database: SQLite
- Auth: JWT

## Features
- Admin dashboard — add, edit, delete, search students
- Bulk attendance marking with date picker
- Student portal — view own record and attendance %
- Role-based access (admin / student)
- Persistent data with SQLite

## Login Credentials
- Admin → username: `admin` / password: `admin123`
- Student → username: Student's roll number (example : 'CS2022001') / password: `student123` (default)

## Running Locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000`

## Project Structure
```
smartrecord/
├── backend/
│   ├── main.py        # FastAPI routes
│   ├── auth.py        # JWT auth
│   ├── database.py    # SQLite layer
│   ├── trie.py        # Trie implementation
│   ├── hashmap.py     # HashMap implementation
│   └── bst.py         # BST implementation
└── frontend/
    └── src/
        └── App.jsx    # React UI
```
