from datetime import datetime
from app.core.database import get_db_connection

def finish_registration(registration_token: str, data: dict):
    """
    Atomically:
    - validates pending token (not expired)
    - creates user
    - creates TA or professor and links to user
    - deletes pending record
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # lock pending row
        cursor.execute(
            """
            SELECT pending_id, name, username, password_hash, role, expires_at
            FROM pending_registration
            WHERE token=%s
            FOR UPDATE
            """,
            (registration_token,)
        )
        row = cursor.fetchone()
        if not row:
            raise ValueError("Invalid registration token")

        pending_id, name, username, pw_hash, role, expires_at = row

        # expire check
        if isinstance(expires_at, str):
            # sometimes connector returns str; safe fallback
            raise ValueError("Token expired")

        if expires_at < datetime.utcnow():
            # remove expired token
            cursor.execute("DELETE FROM pending_registration WHERE pending_id=%s", (pending_id,))
            conn.commit()
            raise ValueError("Registration token expired")

        # create user
        cursor.execute(
            """
            INSERT INTO `user` (username, password, user_type)
            VALUES (%s,%s,%s)
            """,
            (username, pw_hash, role)
        )
        user_id = cursor.lastrowid

        # role-specific onboarding in SAME transaction
        if role == "student":
            # required fields used by your TA onboarding
            cursor.execute(
                """
                INSERT INTO ta (name, program, level, background, admit_term, standing, max_hours)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    data["name"],
                    data["program"],
                    data["level"],
                    data["background"],
                    data["admit_term"],
                    data["standing"],
                    data["max_hours"],
                )
            )
            ta_id = cursor.lastrowid

            for skill in data.get("skills", []):
                cursor.execute(
                    "INSERT INTO ta_skill (ta_id, skill) VALUES (%s,%s)",
                    (ta_id, skill)
                )

            for professor_id in data.get("preferred_professors", []):
                cursor.execute(
                    """
                    INSERT INTO ta_preferred_professor (ta_id, professor_id)
                    VALUES (%s,%s)
                    """,
                    (ta_id, professor_id)
                )

            cursor.execute("UPDATE `user` SET ta_id=%s WHERE user_id=%s", (ta_id, user_id))
            created_role_id = ta_id

        elif role == "faculty":
            cursor.execute("INSERT INTO professor (name) VALUES (%s)", (data["name"],))
            professor_id = cursor.lastrowid

            for ta_id in data.get("preferred_tas", []):
                cursor.execute(
                    """
                    INSERT INTO professor_preferred_ta (professor_id, ta_id)
                    VALUES (%s,%s)
                    """,
                    (professor_id, ta_id)
                )

            cursor.execute("UPDATE `user` SET professor_id=%s WHERE user_id=%s", (professor_id, user_id))
            created_role_id = professor_id

        else:
            created_role_id = None

        # delete pending registration (so abandoned ones never become users)
        cursor.execute("DELETE FROM pending_registration WHERE pending_id=%s", (pending_id,))

        conn.commit()

        return {
            "message": "Registration completed",
            "user_id": user_id,
            "role": role,
            "role_id": created_role_id
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
