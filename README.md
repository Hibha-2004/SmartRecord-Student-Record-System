# SmartRecord 📚
> A student record management system powered by custom Data Structures — Trie, HashMap, and BST — built from scratch in Python.

## 🧠 Data Structures Used

| Structure | Where | Purpose |
|-----------|-------|---------|
| **Trie** | `backend/trie.py` | Name-based autocomplete search |
| **HashMap** | `backend/hashmap.py` | O(1) lookup by roll number |
| **BST** | `backend/bst.py` | Alphabetically sorted student listing |

## 🛠 Tech Stack
- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Deploy:** Vercel (frontend) + Render (backend)

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Student** | Roll number (e.g. `CS2021001`) | `student123` (default) |

> Student passwords are set by the admin when adding a student. The default is `student123`.

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:8000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login as admin or student |
| GET | `/me` | Get current user info |
| POST | `/students` | Add a new student (admin only) |
| GET | `/students` | Get all students BST sorted (admin only) |
| GET | `/students/search?q=<n>` | Trie-based autocomplete (admin only) |
| GET | `/students/{roll}` | Get by roll number |
| PUT | `/students/{roll}` | Update student (admin only) |
| DELETE | `/students/{roll}` | Delete student (admin only) |
| GET | `/stats` | Dashboard statistics (admin only) |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Set Root Directory: `frontend`
4. Build Command: `npm run build`
5. Set env variable: `VITE_API_URL=<your-render-backend-url>`

### Backend → Render
1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📁 Project Structure

```
smartrecord/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── auth.py          # JWT auth + password hashing
│   ├── trie.py          # Custom Trie implementation
│   ├── hashmap.py       # Custom HashMap implementation
│   ├── bst.py           # Custom BST implementation
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.jsx      # Full React UI
```
