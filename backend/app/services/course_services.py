from app.core.database import get_db_connection
from app.models import Course

def get_courses() -> list[Course]:
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM course")
        results = cursor.fetchall()
        return [Course(**row) for row in results]
    
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
