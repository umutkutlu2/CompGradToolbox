from app.core.database import get_db_connection
from app.models import Course
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CourseUpdate(BaseModel):
    course_id: int
    num_tas_requested: int
    skills: List[str]


def get_courses() -> list[Course]:
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM course")
        results = cursor.fetchall()

        for course in results:
            cursor.execute(
                "SELECT skill FROM course_skill WHERE course_id = %s",
                (course["course_id"],)
            )
            skill_rows = cursor.fetchall()
            course["skills"] = [row["skill"] for row in skill_rows]

        return results
    
from app.core.database import get_db_connection
from app.models import Course  # assuming Course model exists

def get_courses_by_professor_username(username: str) -> list[dict]:
    """
    Fetch all courses taught by the professor with the given username,
    including assigned TAs and course skills.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Step 1: Get professor_id from username
    cursor.execute(
        "SELECT professor_id FROM user WHERE username = %s AND professor_id IS NOT NULL",
        (username,)
    )
    prof_row = cursor.fetchone()
    if not prof_row:
        cursor.close()
        conn.close()
        return []

    professor_id = prof_row["professor_id"]

    # Step 2: Get courses taught by this professor
    cursor.execute(
        """
        SELECT c.course_id, c.course_code, c.ps_lab_sections, c.enrollment_capacity,
               c.actual_enrollment, c.num_tas_requested, c.assigned_tas_count
        FROM course c
        JOIN course_professor cp ON c.course_id = cp.course_id
        WHERE cp.professor_id = %s
        """,
        (professor_id,)
    )
    courses = cursor.fetchall()

    for course in courses:
        course_id = course["course_id"]

        # Step 3: Assigned TAs
        cursor.execute(
            """
            SELECT ta.ta_id, ta.name
            FROM ta_assignment
            JOIN ta ON ta_assignment.ta_id = ta.ta_id
            WHERE ta_assignment.course_id = %s
            """,
            (course_id,)
        )
        assigned_rows = cursor.fetchall()
        course["assignedTAs"] = [row["name"] for row in assigned_rows]

        # Step 4: Course skills
        cursor.execute(
            "SELECT skill FROM course_skill WHERE course_id = %s",
            (course_id,)
        )
        skill_rows = cursor.fetchall()
        course["skills"] = [row["skill"] for row in skill_rows]

    cursor.close()
    conn.close()
    return courses

def update_course_in_db(data: CourseUpdate):
    """
    Updates:
    - course.num_tas_requested
    - course_skill table (removes old skills, inserts new)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Update num_tas_requested
        cursor.execute("""
            UPDATE course
            SET num_tas_requested = %s
            WHERE course_id = %s
        """, (data.num_tas_requested, data.course_id))

        # 2. Delete old skills
        cursor.execute("""
            DELETE FROM course_skill
            WHERE course_id = %s
        """, (data.course_id,))

        # 3. Insert new skills
        for skill in data.skills:
            cursor.execute("""
                INSERT INTO course_skill (course_id, skill)
                VALUES (%s, %s)
            """, (data.course_id, skill))

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Course updated successfully"}

    except Exception as e:
        print("Error updating course:", e)
        raise

def create_course_with_professor(course_code: str, username: str, num_tas_requested: int = 0, skills: list[str] = None):
    skills = skills or []
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT professor_id
        FROM user
        WHERE username = %s AND user_type = 'faculty'
    """, (username,))
    prof = cursor.fetchone()
    if not prof:
        raise ValueError("Professor not found")

    cursor.execute("SELECT course_id FROM course WHERE course_code = %s", (course_code,))
    if cursor.fetchone():
        raise ValueError("Course already exists")

    cursor.execute(
        "INSERT INTO course (course_code, num_tas_requested) VALUES (%s, %s)",
        (course_code, num_tas_requested)
    )
    course_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO course_professor (course_id, professor_id) VALUES (%s, %s)",
        (course_id, prof["professor_id"])
    )

    # insert skills (unique + non-empty)
    uniq = []
    for s in skills:
        s2 = (s or "").strip()
        if s2 and s2 not in uniq:
            uniq.append(s2)

    for s in uniq:
        cursor.execute(
            "INSERT INTO course_skill (course_id, skill) VALUES (%s, %s)",
            (course_id, s)
        )

    conn.commit()
    cursor.close()
    conn.close()
    return course_id


def remove_course_from_professor_and_delete_if_orphan(course_id: int, username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # get course_code now (before any delete)
        cursor.execute("SELECT course_code FROM course WHERE course_id = %s", (course_id,))
        course_row = cursor.fetchone()
        course_code = course_row["course_code"] if course_row else f"ID {course_id}"

        # get professor_id
        cursor.execute(
            "SELECT professor_id FROM user WHERE username = %s AND professor_id IS NOT NULL",
            (username,)
        )
        prof_row = cursor.fetchone()
        if not prof_row:
            raise ValueError("Professor not found for given username")
        professor_id = prof_row["professor_id"]

        # ensure link exists
        cursor.execute(
            "SELECT 1 FROM course_professor WHERE course_id = %s AND professor_id = %s",
            (course_id, professor_id)
        )
        if not cursor.fetchone():
            raise ValueError("This course is not linked to this professor")

        # unlink
        cursor.execute(
            "DELETE FROM course_professor WHERE course_id = %s AND professor_id = %s",
            (course_id, professor_id)
        )

        # delete course if orphan
        cursor.execute("SELECT COUNT(*) AS cnt FROM course_professor WHERE course_id = %s", (course_id,))
        remaining = cursor.fetchone()["cnt"]

        deleted_course = False
        if remaining == 0:
            cursor.execute("DELETE FROM course WHERE course_id = %s", (course_id,))
            deleted_course = True

        conn.commit()
        return {
            "message": "Removed course successfully",
            "course_code": course_code,
            "deleted_course": deleted_course
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def get_course_details(course_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Base course fields (match your Course model fields)
    cursor.execute("""
        SELECT course_id, course_code, ps_lab_sections, enrollment_capacity,
               actual_enrollment, num_tas_requested, assigned_tas_count
        FROM course
        WHERE course_id = %s
    """, (course_id,))
    course = cursor.fetchone()
    if not course:
        cursor.close()
        conn.close()
        return None

    # Professors
    cursor.execute("""
        SELECT p.name
        FROM course_professor cp
        JOIN professor p ON cp.professor_id = p.professor_id
        WHERE cp.course_id = %s
    """, (course_id,))
    prof_rows = cursor.fetchall()
    course["professors"] = [r["name"] for r in prof_rows]

    # Assigned TAs (names)
    cursor.execute("""
        SELECT ta.name
        FROM ta_assignment
        JOIN ta ON ta_assignment.ta_id = ta.ta_id
        WHERE ta_assignment.course_id = %s
    """, (course_id,))
    ta_rows = cursor.fetchall()
    course["assignedTAs"] = [r["name"] for r in ta_rows]

    # Skills
    cursor.execute("SELECT skill FROM course_skill WHERE course_id = %s", (course_id,))
    skill_rows = cursor.fetchall()
    course["skills"] = [r["skill"] for r in skill_rows]

    cursor.close()
    conn.close()
    return course

def get_courses_by_ta_username(username: str) -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get ta_id from username
    cursor.execute("""
        SELECT ta_id FROM user
        WHERE username=%s AND ta_id IS NOT NULL
    """, (username,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return []

    ta_id = row["ta_id"]

    # Courses assigned to this TA
    cursor.execute("""
        SELECT
            c.course_id, c.course_code, c.ps_lab_sections, c.enrollment_capacity,
            c.actual_enrollment, c.num_tas_requested, c.assigned_tas_count,
            GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS professor_name
        FROM ta_assignment a
        JOIN course c ON a.course_id = c.course_id
        LEFT JOIN course_professor cp ON cp.course_id = c.course_id
        LEFT JOIN professor p ON p.professor_id = cp.professor_id
        WHERE a.ta_id = %s
        GROUP BY c.course_id
    """, (ta_id,))
    courses = cursor.fetchall()

    for course in courses:
        cid = course["course_id"]

        # Skills
        cursor.execute("SELECT skill FROM course_skill WHERE course_id=%s", (cid,))
        skill_rows = cursor.fetchall()
        course["skills"] = [r["skill"] for r in skill_rows]

        # Assigned TAs (names) for that course
        cursor.execute("""
            SELECT ta.name
            FROM ta_assignment
            JOIN ta ON ta_assignment.ta_id = ta.ta_id
            WHERE ta_assignment.course_id = %s
        """, (cid,))
        assigned_rows = cursor.fetchall()
        course["assignedTAs"] = [r["name"] for r in assigned_rows]

        # Professor name (first professor if multiple)
        cursor.execute("""
            SELECT p.name
            FROM course_professor cp
            JOIN professor p ON cp.professor_id = p.professor_id
            WHERE cp.course_id = %s
            LIMIT 1
        """, (cid,))
        prow = cursor.fetchone()
        course["professor_name"] = prow["name"] if prow else None


    cursor.close()
    conn.close()
    return courses
