from app.core.database import get_db_connection

def get_all_tas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Step 1: Get all TAs
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

    if not tas:
        cursor.close()
        conn.close()
        return []

    ta_ids = [ta["ta_id"] for ta in tas]

    # Step 2: Get preferred professors for all TAs
    pref_query = f"""
        SELECT 
            tpp.ta_id,
            p.professor_id,
            p.name
        FROM ta_preferred_professor tpp
        JOIN professor p ON tpp.professor_id = p.professor_id
        WHERE tpp.ta_id IN ({','.join(['%s']*len(ta_ids))});
    """
    cursor.execute(pref_query, ta_ids)
    pref_rows = cursor.fetchall()

    # Map preferred professors by TA ID
    pref_map = {}
    for row in pref_rows:
        pref_map.setdefault(row["ta_id"], []).append({
            "professor_id": row["professor_id"],
            "name": row["name"]
        })

    # Step 3: Get all skills for all TAs
    skills_query = f"""
        SELECT ta_id, skill
        FROM ta_skill
        WHERE ta_id IN ({','.join(['%s']*len(ta_ids))});
    """
    cursor.execute(skills_query, ta_ids)
    skill_rows = cursor.fetchall()

    # Map skills by TA ID
    skills_map = {}
    for row in skill_rows:
        skills_map.setdefault(row["ta_id"], []).append(row["skill"])

    # Combine all data
    for ta in tas:
        ta["preferred_professors"] = pref_map.get(ta["ta_id"], [])
        ta["skills"] = skills_map.get(ta["ta_id"], [])

    cursor.close()
    conn.close()

    return tas
