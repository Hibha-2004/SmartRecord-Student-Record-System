from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

from trie import Trie
from hashmap import HashMap
from bst import BST
from auth import hash_password, verify_password, create_token, get_current_user, require_admin
from database import init_db, db_insert_student, db_update_student, db_delete_student, db_get_all_students, db_get_student

app = FastAPI(title="SmartRecord API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory DS (loaded from DB on startup)
trie = Trie()
hashmap = HashMap()
bst = BST()

ADMIN = {
    "username": "admin",
    "password_hash": hash_password("admin123"),
    "role": "admin"
}


@app.on_event("startup")
def startup():
    init_db()
    # Load all students from DB into in-memory DS
    for record in db_get_all_students():
        hashmap.put(record["roll_number"], record)
        trie.insert(record["name"], record["roll_number"])
        bst.insert(record["name"], record["roll_number"])


# ─── Models ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class Student(BaseModel):
    name: str
    roll_number: str
    department: str
    year: int
    cgpa: float
    email: str
    phone: Optional[str] = ""
    password: Optional[str] = "student123"

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


# ─── Auth ────────────────────────────────────────────────────────────────────

@app.post("/login")
def login(req: LoginRequest):
    if req.username == ADMIN["username"]:
        if not verify_password(req.password, ADMIN["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_token({"sub": "admin", "role": "admin", "name": "Admin"})
        return {"token": token, "role": "admin", "name": "Admin"}

    record = hashmap.get(req.username)
    if not record:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(req.password, record.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": record["roll_number"], "role": "student", "name": record["name"], "roll_number": record["roll_number"]})
    return {"token": token, "role": "student", "name": record["name"], "roll_number": record["roll_number"]}


@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    if user["role"] == "student":
        record = hashmap.get(user["roll_number"])
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        return {k: v for k, v in record.items() if k != "password_hash"}
    return {"role": "admin", "name": "Admin"}


# ─── Student Routes ───────────────────────────────────────────────────────────

@app.post("/students", status_code=201)
def add_student(student: Student, user: dict = Depends(require_admin)):
    if hashmap.exists(student.roll_number):
        raise HTTPException(status_code=400, detail="Roll number already exists")

    record = {
        "id": str(uuid.uuid4()),
        "name": student.name,
        "roll_number": student.roll_number,
        "department": student.department,
        "year": student.year,
        "cgpa": student.cgpa,
        "email": student.email,
        "phone": student.phone,
        "password_hash": hash_password(student.password or "student123"),
    }

    db_insert_student(record)
    hashmap.put(student.roll_number, record)
    trie.insert(student.name, student.roll_number)
    bst.insert(student.name, student.roll_number)

    return {"message": "Student added", "student": {k: v for k, v in record.items() if k != "password_hash"}}


@app.get("/students")
def get_all_students(user: dict = Depends(require_admin)):
    ordered_ids = bst.inorder()
    seen, students = set(), []
    for roll_no in ordered_ids:
        if roll_no not in seen:
            r = hashmap.get(roll_no)
            if r:
                students.append({k: v for k, v in r.items() if k != "password_hash"})
                seen.add(roll_no)
    return {"students": students, "count": len(students)}


@app.get("/students/search")
def search_students(q: str, user: dict = Depends(require_admin)):
    if not q:
        return {"students": [], "count": 0}
    roll_numbers = trie.search_prefix(q)
    students, seen = [], set()
    for roll_no in roll_numbers:
        if roll_no not in seen:
            r = hashmap.get(roll_no)
            if r:
                students.append({k: v for k, v in r.items() if k != "password_hash"})
                seen.add(roll_no)
    return {"students": students, "count": len(students), "query": q}


@app.get("/students/{roll_number}")
def get_student(roll_number: str, user: dict = Depends(get_current_user)):
    if user["role"] == "student" and user.get("roll_number") != roll_number:
        raise HTTPException(status_code=403, detail="Access denied")
    record = hashmap.get(roll_number)
    if not record:
        raise HTTPException(status_code=404, detail="Student not found")
    return {k: v for k, v in record.items() if k != "password_hash"}


@app.put("/students/{roll_number}")
def update_student(roll_number: str, update: StudentUpdate, user: dict = Depends(require_admin)):
    record = hashmap.get(roll_number)
    if not record:
        raise HTTPException(status_code=404, detail="Student not found")

    old_name = record["name"]
    if update.name and update.name != old_name:
        trie.delete(old_name, roll_number)
        bst.delete(old_name, roll_number)
        trie.insert(update.name, roll_number)
        bst.insert(update.name, roll_number)
        record["name"] = update.name

    if update.department is not None: record["department"] = update.department
    if update.year is not None: record["year"] = update.year
    if update.cgpa is not None: record["cgpa"] = update.cgpa
    if update.email is not None: record["email"] = update.email
    if update.phone is not None: record["phone"] = update.phone
    if update.password: record["password_hash"] = hash_password(update.password)

    db_update_student(roll_number, record)
    hashmap.put(roll_number, record)

    return {"message": "Updated", "student": {k: v for k, v in record.items() if k != "password_hash"}}


@app.delete("/students/{roll_number}")
def delete_student(roll_number: str, user: dict = Depends(require_admin)):
    record = hashmap.get(roll_number)
    if not record:
        raise HTTPException(status_code=404, detail="Student not found")

    db_delete_student(roll_number)
    trie.delete(record["name"], roll_number)
    bst.delete(record["name"], roll_number)
    hashmap.delete(roll_number)

    return {"message": "Deleted"}


@app.get("/stats")
def get_stats(user: dict = Depends(require_admin)):
    all_students = hashmap.get_all()
    if not all_students:
        return {"total": 0, "avg_cgpa": 0, "departments": {}, "year_distribution": {}}
    dept_count, year_count, total_cgpa = {}, {}, 0
    for s in all_students:
        dept_count[s["department"]] = dept_count.get(s["department"], 0) + 1
        year_count[str(s["year"])] = year_count.get(str(s["year"]), 0) + 1
        total_cgpa += s["cgpa"]
    return {
        "total": len(all_students),
        "avg_cgpa": round(total_cgpa / len(all_students), 2),
        "departments": dept_count,
        "year_distribution": year_count,
    }
