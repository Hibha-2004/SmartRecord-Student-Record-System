import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "smartrecord.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            roll_number TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            year INTEGER NOT NULL,
            cgpa REAL NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
            UNIQUE(roll_number, date),
            FOREIGN KEY(roll_number) REFERENCES students(roll_number)
        )
    """)
    conn.commit()
    conn.close()


def db_insert_student(record: dict):
    conn = get_connection()
    conn.execute("""
        INSERT INTO students (id, name, roll_number, department, year, cgpa, email, phone, password_hash)
        VALUES (:id, :name, :roll_number, :department, :year, :cgpa, :email, :phone, :password_hash)
    """, record)
    conn.commit()
    conn.close()


def db_update_student(roll_number: str, record: dict):
    conn = get_connection()
    conn.execute("""
        UPDATE students SET
            name = :name,
            department = :department,
            year = :year,
            cgpa = :cgpa,
            email = :email,
            phone = :phone,
            password_hash = :password_hash
        WHERE roll_number = :roll_number
    """, {**record, "roll_number": roll_number})
    conn.commit()
    conn.close()


def db_delete_student(roll_number: str):
    conn = get_connection()
    conn.execute("DELETE FROM students WHERE roll_number = ?", (roll_number,))
    conn.commit()
    conn.close()


def db_get_all_students() -> list:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM students").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def db_get_student(roll_number: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM students WHERE roll_number = ?", (roll_number,)).fetchone()
    conn.close()
    return dict(row) if row else None


def db_mark_attendance(records: list):
    conn = get_connection()
    conn.executemany("""
        INSERT INTO attendance (roll_number, date, status)
        VALUES (:roll_number, :date, :status)
        ON CONFLICT(roll_number, date) DO UPDATE SET status = excluded.status
    """, records)
    conn.commit()
    conn.close()


def db_get_attendance_by_student(roll_number: str) -> dict:
    conn = get_connection()
    rows = conn.execute(
        "SELECT status FROM attendance WHERE roll_number = ?", (roll_number,)
    ).fetchall()
    conn.close()
    total = len(rows)
    present = sum(1 for r in rows if r["status"] == "present")
    percentage = round((present / total) * 100, 1) if total > 0 else None
    return {"total": total, "present": present, "percentage": percentage}


def db_get_attendance_by_date(date: str) -> list:
    conn = get_connection()
    rows = conn.execute(
        "SELECT roll_number, status FROM attendance WHERE date = ?", (date,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def db_get_all_attendance_stats() -> list:
    conn = get_connection()
    rows = conn.execute("""
        SELECT roll_number,
               COUNT(*) as total,
               SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present
        FROM attendance
        GROUP BY roll_number
    """).fetchall()
    conn.close()
    result = []
    for r in rows:
        pct = round((r["present"] / r["total"]) * 100, 1) if r["total"] > 0 else None
        result.append({"roll_number": r["roll_number"], "total": r["total"], "present": r["present"], "percentage": pct})
    return result
