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


def db_get_student(roll_number: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM students WHERE roll_number = ?", (roll_number,)).fetchone()
    conn.close()
    return dict(row) if row else None
