from datetime import datetime, timedelta
import secrets

from app.core.database import get_db_connection
from app.core.security import hash_password

PENDING_TTL_MINUTES = 30

def start_registration(name: str, username: str, password: str, role: str):
    """
    Creates a pending registration record instead of a real user.
    Returns a token that must be used to finish onboarding.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1) username must not exist in real users
        cursor.execute("SELECT user_id FROM `user` WHERE username=%s", (username,))
        if cursor.fetchone():
            raise ValueError("Username already exists")

        # 2) username must not exist in pending
        cursor.execute("SELECT pending_id FROM pending_registration WHERE username=%s", (username,))
        if cursor.fetchone():
            raise ValueError("Username is already pending registration (try again in a few minutes)")

        token = secrets.token_hex(24)
        pw_hash = hash_password(password)

        expires_at = datetime.utcnow() + timedelta(minutes=PENDING_TTL_MINUTES)

        cursor.execute(
            """
            INSERT INTO pending_registration (name, username, password_hash, role, token, expires_at)
            VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (name, username, pw_hash, role, token, expires_at)
        )

        conn.commit()
        return token

    finally:
        cursor.close()
        conn.close()
