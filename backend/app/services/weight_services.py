from app.core.database import get_db_connection
from app.models import Weights

def get_weights() -> Weights:
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)  # dictionary=True to get column names
        result = cursor.execute("SELECT * FROM weights LIMIT 1")
        result = cursor.fetchone()
        return Weights(
            ta_pref=result['ta_pref'],
            prof_pref=result['prof_pref'],
            course_pref=result['course_pref'],
            workload_balance=result['workload_balance']
        )

def update_weights(weights: Weights):
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE weights
            SET ta_pref=%(ta_pref)s, prof_pref=%(prof_pref)s,
                course_pref=%(course_pref)s, workload_balance=%(workload_balance)s
            WHERE id=1
            """,
            weights.model_dump()
        )
        conn.commit()
        cursor.close()
