from app.core.database import get_db_connection

def get_user_by_id(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT user_id, username, user_type, ta_id, professor_id
        FROM user
        WHERE user_id = %s
        """,
        (user_id,),
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()
    return user
