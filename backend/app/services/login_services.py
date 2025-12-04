from app.core.database import get_db_connection

def authenticate_user(username: str, password: str) -> dict | None:
    """
    Check the user table for matching username/password.
    Return a dict with user info if valid, None otherwise.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT user_id, username, user_type, ta_id, professor_id
            FROM user
            WHERE username=%s AND password=%s
            """,
            (username, password)
        )
        user = cursor.fetchone()
        cursor.close()

    if not user:
        return None

    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "user_type": user["user_type"],
        "ta_id": user.get("ta_id"),
        "professor_id": user.get("professor_id")
    }