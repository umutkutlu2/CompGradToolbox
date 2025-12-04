from app.core.database import get_db_connection

def get_all_professors():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            professor_id,
            name
        FROM professor
        ORDER BY name ASC;
    """
    cursor.execute(query)
    professors = cursor.fetchall()

    # Get preferred TAs for each professor
    pref_query = """
        SELECT 
            t.ta_id,
            t.name,
            t.program,
            t.level,
            t.max_hours
        FROM professor_preferred_ta ppt
        JOIN ta t 
            ON ppt.ta_id = t.ta_id
        WHERE ppt.professor_id = %s;
    """

    for prof in professors:
        cursor.execute(pref_query, (prof["professor_id"],))
        preferred_tas = cursor.fetchall()
        prof["preferred_tas"] = preferred_tas

    cursor.close()
    conn.close()

    return professors
