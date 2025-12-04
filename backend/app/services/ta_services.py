from app.core.database import get_db_connection

def get_all_tas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            ta_id,
            name,
            program,
            level,
            max_hours
        FROM ta
        ORDER BY name ASC;
    """

    cursor.execute(query)
    tas = cursor.fetchall()

    #get preferred prof for each TA
    pref_query = """
        SELECT 
            p.professor_id,
            p.name
        FROM ta_preferred_professor tpp
        JOIN professor p 
            ON tpp.professor_id = p.professor_id
        WHERE tpp.ta_id = %s;
    """

    for ta in tas:
        cursor.execute(pref_query, (ta["ta_id"],))
        preferred_professors = cursor.fetchall()
        ta["preferred_professors"] = preferred_professors 

    cursor.close()
    conn.close()

    return tas
