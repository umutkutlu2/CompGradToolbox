import pandas as pd
from sqlalchemy import create_engine, text
import re
import unicodedata

def normalize_name(name):
    """Normalize names to ASCII-only characters, removing accents and special chars."""
    if pd.isna(name) or not isinstance(name, str):
        return name
    
    # Handle special Turkish characters that don't decompose properly
    replacements = {
        'ı': 'i', 'İ': 'I',  # Turkish dotless i and dotted I
        'ğ': 'g', 'Ğ': 'G',  # Turkish soft g
        'ş': 's', 'Ş': 'S',  # Turkish s with cedilla
        'ç': 'c', 'Ç': 'C',  # c with cedilla
        'ö': 'o', 'Ö': 'O',  # o with umlaut
        'ü': 'u', 'Ü': 'U',  # u with umlaut
    }
    
    result = name
    for turkish_char, ascii_char in replacements.items():
        result = result.replace(turkish_char, ascii_char)
    
    # Normalize unicode characters (decompose accented chars)
    normalized = unicodedata.normalize('NFD', result)
    
    # Remove combining characters (accents) and keep only ASCII
    ascii_name = ''.join(
        char for char in normalized 
        if unicodedata.category(char) != 'Mn'  # Mn = Mark, Nonspacing
    )
    
    return ascii_name.strip()

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
    """Split a cell containing one or more names into a list of normalized names."""
    if pd.isna(name_cell):
        return []
    s = str(name_cell).strip()
    if s == "":
        return []
    parts = re.split(r',|;|/|\band\b|&|\n', s)
    parts = [normalize_name(p.strip()) for p in parts if p and p.strip()]
    return parts

def import_excel_data(excel_path, mysql_user, mysql_password):
    """Import professors, TAs, courses, and their relations."""
    print("\n" + "="*60)
    print("IMPORTING EXCEL DATA INTO DATABASE")
    print("="*60)

    try:
        engine = create_engine(
            f"mysql+pymysql://{mysql_user}:{mysql_password}@localhost/TA_Assignment_System?charset=utf8mb4",
        )

        with engine.begin() as conn:
            # Read Excel files
            df_courses = pd.read_excel(excel_path, sheet_name="TA Needs Planning", dtype=str)
            df_tas = pd.read_excel(excel_path, sheet_name="COMP TA List", dtype=str)

            # Rename columns
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

            # Clean numeric columns
            numeric_cols = [
                'enrollment_capacity', 'actual_enrollment',
                'num_tas_requested', 'assigned_tas_count'
            ]
            for col in numeric_cols:
                if col in df_courses.columns:
                    df_courses[col] = df_courses[col].apply(lambda v: clean_value(v, numeric=True))

            # Clean TA columns
            for col in df_tas.columns:
                if col not in ['thesis_advisor', 'standing', 'name']:
                    df_tas[col] = df_tas[col].apply(clean_value)

            # Normalize TA names
            if 'name' in df_tas.columns:
                df_tas['name'] = df_tas['name'].apply(normalize_name)

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

            # ============================================================
            # STEP 1: Insert Professors (with duplicate prevention)
            # ============================================================
            all_professors = set()

            if 'faculty_name' in df_courses.columns:
                for faculty_cell in df_courses['faculty_name'].dropna():
                    all_professors.update(split_names(faculty_cell))

            if 'thesis_advisor' in df_tas.columns:
                for adv_cell in df_tas['thesis_advisor'].dropna():
                    all_professors.update(split_names(adv_cell))

            if all_professors:
                print(f"Inserting {len(all_professors)} professors...")
                for prof_name in all_professors:
                    conn.execute(
                        text("INSERT IGNORE INTO professor (name) VALUES (:name)"),
                        {"name": prof_name}
                    )

            # Fetch all professors (including pre-existing ones)
            prof_df = pd.read_sql("SELECT professor_id, name FROM professor", conn)
            prof_map = {row['name']: row['professor_id'] for _, row in prof_df.iterrows()}
            print(f"✓ Total professors in database: {len(prof_map)}")

            # ============================================================
            # STEP 2: Insert Courses (with duplicate prevention)
            # ============================================================
            course_columns = [
                'course_code', 'ps_lab_sections',
                'enrollment_capacity', 'actual_enrollment',
                'num_tas_requested', 'assigned_tas_count'
            ]
            cols_present = [c for c in course_columns if c in df_courses.columns]
            
            if cols_present:
                print(f"Inserting courses...")
                for _, row in df_courses.iterrows():
                    course_code = row.get('course_code')
                    if pd.isna(course_code) or not course_code:
                        continue
                    
                    # Build dynamic INSERT IGNORE query
                    cols_to_insert = [c for c in cols_present if c in row.index and not pd.isna(row[c])]
                    if 'course_code' not in cols_to_insert:
                        cols_to_insert.insert(0, 'course_code')
                    
                    placeholders = ', '.join([f':{col}' for col in cols_to_insert])
                    col_names = ', '.join(cols_to_insert)
                    
                    values = {col: row[col] for col in cols_to_insert}
                    
                    conn.execute(
                        text(f"INSERT IGNORE INTO course ({col_names}) VALUES ({placeholders})"),
                        values
                    )

            # Fetch all courses
            course_df = pd.read_sql("SELECT course_id, course_code FROM course", conn)
            course_map = {row['course_code']: row['course_id'] for _, row in course_df.iterrows()}
            print(f"✓ Total courses in database: {len(course_map)}")

            # ============================================================
            # STEP 3: Insert Course-Professor relationships
            # ============================================================
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
                print(f"Inserting course-professor relationships...")
                cp_df = pd.DataFrame(cp_rows).drop_duplicates()
                for _, row in cp_df.iterrows():
                    conn.execute(
                        text("""INSERT IGNORE INTO course_professor (course_id, professor_id) 
                               VALUES (:course_id, :professor_id)"""),
                        {"course_id": int(row['course_id']), "professor_id": int(row['professor_id'])}
                    )
                print(f"✓ Inserted {len(cp_df)} course-professor links")

            # ============================================================
            # STEP 4: Insert TAs (with duplicate prevention)
            # ============================================================
            ta_columns = [
                'name', 'program', 'level', 'background', 'admit_term',
                'standing', 'notes', 'bs_school_program', 'ms_school_program'
            ]
            ta_cols_present = [c for c in ta_columns if c in df_tas.columns]
            
            if ta_cols_present:
                print(f"Inserting TAs...")
                for _, row in df_tas.iterrows():
                    ta_name = row.get('name')
                    if pd.isna(ta_name) or not ta_name:
                        continue
                    
                    cols_to_insert = [c for c in ta_cols_present if c in row.index and not pd.isna(row[c])]
                    if 'name' not in cols_to_insert:
                        cols_to_insert.insert(0, 'name')
                    
                    placeholders = ', '.join([f':{col}' for col in cols_to_insert])
                    col_names = ', '.join(cols_to_insert)
                    
                    values = {col: row[col] for col in cols_to_insert}
                    
                    conn.execute(
                        text(f"INSERT IGNORE INTO ta ({col_names}) VALUES ({placeholders})"),
                        values
                    )

            # Fetch all TAs
            ta_df = pd.read_sql("SELECT ta_id, name FROM ta", conn)
            ta_map = {row['name']: row['ta_id'] for _, row in ta_df.iterrows()}
            print(f"✓ Total TAs in database: {len(ta_map)}")

            # ============================================================
            # STEP 5: Insert TA-Advisor relationships
            # ============================================================
            ta_adv_rows = []
            for _, row in df_tas.iterrows():
                ta_id = ta_map.get(normalize_name(row.get('name')))
                if not ta_id:
                    continue
                for adv_name in split_names(row.get('thesis_advisor', '')):
                    prof_id = prof_map.get(adv_name)
                    if prof_id:
                        ta_adv_rows.append({'ta_id': ta_id, 'professor_id': prof_id})
            
            if ta_adv_rows:
                print(f"Inserting TA-advisor relationships...")
                ta_adv_df = pd.DataFrame(ta_adv_rows).drop_duplicates()
                for _, row in ta_adv_df.iterrows():
                    conn.execute(
                        text("""INSERT IGNORE INTO ta_thesis_advisor (ta_id, professor_id) 
                               VALUES (:ta_id, :professor_id)"""),
                        {"ta_id": int(row['ta_id']), "professor_id": int(row['professor_id'])}
                    )
                print(f"✓ Inserted {len(ta_adv_df)} TA-advisor links")

            # ============================================================
            # STEP 6: Insert Preferred TAs
            # ============================================================
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
                print(f"Inserting preferred TAs...")
                pref_df = pd.DataFrame(pref_rows).drop_duplicates()
                for _, row in pref_df.iterrows():
                    conn.execute(
                        text("""INSERT IGNORE INTO course_preferred_ta (course_id, ta_id) 
                               VALUES (:course_id, :ta_id)"""),
                        {"course_id": int(row['course_id']), "ta_id": int(row['ta_id'])}
                    )
                print(f"✓ Inserted {len(pref_df)} preferred TA preferences")

            # ============================================================
            # STEP 7: Insert TA Assignments
            # ============================================================
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
                print(f"Inserting TA assignments...")
                assign_df = pd.DataFrame(assign_rows).drop_duplicates()
                for _, row in assign_df.iterrows():
                    conn.execute(
                        text("""INSERT IGNORE INTO ta_assignment (ta_id, course_id) 
                               VALUES (:ta_id, :course_id)"""),
                        {"ta_id": int(row['ta_id']), "course_id": int(row['course_id'])}
                    )
                print(f"✓ Inserted {len(assign_df)} TA assignments")

        print("\n" + "="*60)
        print("✅ Excel data successfully imported.")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Import failed: {e}")
        raise