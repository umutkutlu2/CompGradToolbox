from itertools import product
from .ta_services import get_all_tas
from .professors_services import get_all_professors
from .weight_services import get_weights
from app.core.database import get_db_connection
import logging

def rank_to_score(rank, max_rank):
    return (max_rank - rank) / max_rank

def compute_weighted_score(ta_name, prof_name, current_workload, avg_workload, TAs, Professors):
    ta = TAs[ta_name]
    prof = Professors[prof_name]

    weights = get_weights()  # from DB

    # TA preference for professor
    ta_rank = ta["prof_pref"].index(prof_name) if prof_name in ta["prof_pref"] else len(ta["prof_pref"])
    ta_score = rank_to_score(ta_rank, len(ta["prof_pref"]))

    # Professor preference for TA
    prof_rank = prof["ta_pref"].index(ta_name) if ta_name in prof["ta_pref"] else len(prof["ta_pref"])
    prof_score = rank_to_score(prof_rank, len(prof["ta_pref"]))

    # Workload balancing
    workload_diff = abs(current_workload - avg_workload)
    max_hours = max(ta["max_hours"], 1)
    workload_score = max(0, 1 - (workload_diff / max_hours))

    # Weighted total
    total_score = (
        weights.ta_pref * ta_score +
        weights.prof_pref * prof_score +
        weights.workload_balance * workload_score
    )

    return total_score

def run_assignment_algorithm():
    """Runs the TA assignment algorithm and stores assignments in DB."""
    # Fetch TAs and Professors from DB
    tas_db = get_all_tas()
    TAs = {}
    for ta in tas_db:
        TAs[ta["name"]] = {
            "id": ta["ta_id"],  # store TA ID for DB insertion
            "prof_pref": [p["name"] for p in ta.get("preferred_professors", [])],
            "max_hours": ta["max_hours"]
        }

    profs_db = get_all_professors()
    Professors = {}
    for prof in profs_db:
        Professors[prof["name"]] = {
            "id": prof["professor_id"],  # store professor ID for DB
            "ta_pref": [ta["name"] for ta in prof.get("preferred_tas", [])],
            "num_TAs": 2,  # can be dynamic if stored in DB
            "courses": prof.get("courses", [])  # optional: track courses
        }

    assignments = {prof: [] for prof in Professors}
    ta_workload = {ta: 0 for ta in TAs}
    total_slots = sum([Professors[p]["num_TAs"] for p in Professors])
    avg_workload = total_slots / len(TAs)

    # Generate all possible TA-professor pairs
    possible_assignments = list(product(TAs.keys(), Professors.keys()))

    # Compute weighted scores
    scores = [
        (compute_weighted_score(ta, prof, ta_workload[ta], avg_workload, TAs, Professors), ta, prof)
        for ta, prof in possible_assignments
    ]

    # Sort descending by score
    scores.sort(reverse=True, key=lambda x: x[0])

    # Assign greedily
    for score, ta, prof in scores:
        if len(assignments[prof]) < Professors[prof]["num_TAs"] and ta_workload[ta] < TAs[ta]["max_hours"]:
            assignments[prof].append(ta)
            ta_workload[ta] += 1
    return {
        "assignments": assignments,
        "workloads": ta_workload
    }
def updateDB(assignments: dict):
    """
    Updates the database with TA assignments.
    assignments: dict in format
    { 'Professor Name': ['TA Name1', 'TA Name2', ...], ... }
    """
    # Map TA names to IDs
    tas_db = get_all_tas()
    TAs = {ta["name"]: ta["ta_id"] for ta in tas_db}

    profs_db = get_all_professors()
    Professors = {prof["name"]: prof["professor_id"] for prof in profs_db}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 1: Truncate old assignments
        print("Truncating old TA assignments...")
        cursor.execute("TRUNCATE TABLE ta_assignment")

        # Step 2: Insert new assignments
        for prof_name, ta_names in assignments.items():
            if prof_name not in Professors:
                print(f"Warning: Professor '{prof_name}' not found in DB, skipping.")
                continue

            prof_id = Professors[prof_name]

            # Get all course_ids for this professor from course_professor
            cursor.execute(
                "SELECT course_id FROM course_professor WHERE professor_id = %s",
                (prof_id,)
            )
            course_rows = cursor.fetchall()
            if not course_rows:
                print(f"Warning: Professor '{prof_name}' has no courses, skipping.")
                continue

            course_ids = [row[0] for row in course_rows]

            for ta_name in ta_names:
                if ta_name not in TAs:
                    print(f"Warning: TA '{ta_name}' not found in DB, skipping.")
                    continue
                ta_id = TAs[ta_name]

                # Insert TA assignment for each course
                for course_id in course_ids:
                    cursor.execute(
                        "INSERT INTO ta_assignment (ta_id, course_id) VALUES (%s, %s)",
                        (ta_id, course_id)
                    )
                    print(f"Assigned TA '{ta_name}' to course_id {course_id} (Prof: {prof_name})")

        # Commit all changes
        conn.commit()
        print("All assignments successfully updated in the database.")

    except Exception as e:
        print("Error updating database:", e)
    finally:
        cursor.close()
        conn.close()
