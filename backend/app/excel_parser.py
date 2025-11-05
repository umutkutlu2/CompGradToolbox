from sqlalchemy import create_engine
import pandas as pd
import re
from app.core.config import Settings

settings = Settings()

def get_db_engine():
    """Create database engine."""
    return create_engine(
        f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}/{settings.DB_NAME}?charset=utf8mb4",
        pool_pre_ping=True
    )

def clean_value(val, numeric=False):
    """Clean and normalize cell values."""
    if pd.isna(val):
        return None

    if isinstance(val, str):
        val = val.strip()
        if val == "" or val.lower() in ["nan", "none", "-"]:
            return None

    if numeric:
        if isinstance(val, str):
            match = re.findall(r"[\d.]+", val)
            if not match:
                return None
            val = match[0]
        try:
            if "." in str(val):
                return float(val)
            return int(val)
        except ValueError:
            return None

    return val

def split_names(name_cell):
    """Split a cell containing one or more names into a list of names."""
    if pd.isna(name_cell):
        return []
    s = str(name_cell).strip()
    if s == "":
        return []
    parts = re.split(r',|;|/|\band\b|&|\n', s)
    parts = [p.strip() for p in parts if p and p.strip()]
    return parts

def import_excel_data(excel_path):
    """Import professors, TAs, courses, and their relations."""
    print("\n" + "="*60)
    print("IMPORTING EXCEL DATA INTO DATABASE")
    print("="*60)

    engine = get_db_engine()

    df_courses = pd.read_excel(excel_path, sheet_name="TA Needs Planning", dtype=str)
    df_tas = pd.read_excel(excel_path, sheet_name="COMP TA List", dtype=str)

    df_courses = df_courses.rename(columns={
        'Course': 'course_code',
        'Faculty': 'faculty_name',
        'PS/Lab Sections': 'ps_lab_sections',
        'Enrollment Capacity': 'enrollment_capacity',
        'Actual Enrollment': 'actual_enrollment',
        '\n\nNumber of TAs requested for Spring 2025': 'num_tas_requested',
        'Number of TAs requested for Spring 2025': 'num_tas_requested',
        'Assigned TAs for Spring 2025 (number)': 'assigned_tas_count',
        'Assigned TAs for Spring 2025 (names)': 'assigned_tas_names',
        'Preferred TAs (or requirements)': 'preferred_tas',
        'Preferred TAs (or requirements) ': 'preferred_tas',
    })
    df_tas = df_tas.rename(columns={
        'NAME': 'name',
        'PROGRAM': 'program',
        'MS/PhD': 'level',
        'BACKGROUND': 'background',
        'ADMIT TERM': 'admit_term',
        'STANDING': 'standing',
        'THESIS ADVISOR': 'thesis_advisor',
        'NOTES': 'notes',
        'BS SCHOOL/PROGRAM': 'bs_school_program',
        'MS SCHOOL/PROGRAM': 'ms_school_program'
    })

    df_courses.columns = df_courses.columns.str.strip()
    df_tas.columns = df_tas.columns.str.strip()

    numeric_cols = [
        'enrollment_capacity', 'actual_enrollment',
        'num_tas_requested', 'assigned_tas_count'
    ]
    for col in numeric_cols:
        if col in df_courses.columns:
            df_courses[col] = df_courses[col].apply(lambda v: clean_value(v, numeric=True))

    for col in df_tas.columns:
        if col not in ['thesis_advisor', 'standing']:
            df_tas[col] = df_tas[col].apply(clean_value)

    if 'standing' in df_tas.columns:
        def clean_standing(v):
            val = clean_value(v, numeric=True)
            if val is None:
                return None
            try:
                return int(round(float(val)))
            except Exception:
                return None
        df_tas['standing'] = df_tas['standing'].apply(clean_standing)

    all_professors = set()

    if 'faculty_name' in df_courses.columns:
        for faculty_cell in df_courses['faculty_name'].dropna():
            all_professors.update(split_names(faculty_cell))

    if 'thesis_advisor' in df_tas.columns:
        for adv_cell in df_tas['thesis_advisor'].dropna():
            all_professors.update(split_names(adv_cell))

    if all_professors:
        professors_df = pd.DataFrame({'name': list(all_professors)})
        professors_df.to_sql('professor', engine, if_exists='append', index=False)

    prof_df = pd.read_sql("SELECT professor_id, name FROM professor", engine)
    prof_map = {row['name']: row['professor_id'] for _, row in prof_df.iterrows()}

    course_columns = [
        'course_code', 'ps_lab_sections',
        'enrollment_capacity', 'actual_enrollment',
        'num_tas_requested', 'assigned_tas_count'
    ]
    cols_present = [c for c in course_columns if c in df_courses.columns]
    if cols_present:
        df_courses[cols_present].to_sql('course', engine, if_exists='append', index=False)

    course_df = pd.read_sql("SELECT course_id, course_code FROM course", engine)
    course_map = {row['course_code']: row['course_id'] for _, row in course_df.iterrows()}

    cp_rows = []
    for _, row in df_courses.iterrows():
        cid = course_map.get(row.get('course_code'))
        if not cid:
            continue
        for pname in split_names(row.get('faculty_name', '')):
            pid = prof_map.get(pname)
            if pid:
                cp_rows.append({'course_id': cid, 'professor_id': pid})
    if cp_rows:
        pd.DataFrame(cp_rows).drop_duplicates().to_sql('course_professor', engine, if_exists='append', index=False)

    ta_columns = [
        'name', 'program', 'level', 'background', 'admit_term',
        'standing', 'notes', 'bs_school_program', 'ms_school_program'
    ]
    ta_cols_present = [c for c in ta_columns if c in df_tas.columns]
    df_tas[ta_cols_present].to_sql('ta', engine, if_exists='append', index=False)

    ta_df = pd.read_sql("SELECT ta_id, name FROM ta", engine)
    ta_map = {row['name']: row['ta_id'] for _, row in ta_df.iterrows()}

    ta_adv_rows = []
    for _, row in df_tas.iterrows():
        ta_id = ta_map.get(row.get('name'))
        if not ta_id:
            continue
        for adv_name in split_names(row.get('thesis_advisor', '')):
            prof_id = prof_map.get(adv_name)
            if prof_id:
                ta_adv_rows.append({'ta_id': ta_id, 'professor_id': prof_id})
    if ta_adv_rows:
        pd.DataFrame(ta_adv_rows).drop_duplicates().to_sql('ta_thesis_advisor', engine, if_exists='append', index=False)

    pref_rows = []
    for _, row in df_courses.iterrows():
        cid = course_map.get(row.get('course_code'))
        if not cid:
            continue
        for tname in split_names(row.get('preferred_tas', '')):
            ta_id = ta_map.get(tname)
            if ta_id:
                pref_rows.append({'course_id': cid, 'ta_id': ta_id})
    if pref_rows:
        pd.DataFrame(pref_rows).drop_duplicates().to_sql('course_preferred_ta', engine, if_exists='append', index=False)

    assign_rows = []
    for _, row in df_courses.iterrows():
        cid = course_map.get(row.get('course_code'))
        if not cid:
            continue
        for tname in split_names(row.get('assigned_tas_names', '')):
            ta_id = ta_map.get(tname)
            if ta_id:
                assign_rows.append({'ta_id': ta_id, 'course_id': cid})
    if assign_rows:
        pd.DataFrame(assign_rows).drop_duplicates().to_sql('ta_assignment', engine, if_exists='append', index=False)

    print("✅ Excel data successfully imported.")