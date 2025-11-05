import mysql.connector
from mysql.connector import Error

def run_sql_file(host, user, password, sql_file):
    """Execute all SQL statements from a .sql file."""
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
        )
        cursor = connection.cursor()
        print(f"Executing SQL file: {sql_file} ...")

        with open(sql_file, "r") as f:
            sql_commands = f.read()

        for command in sql_commands.split(";"):
            command = command.strip()
            if command:
                cursor.execute(command)
        connection.commit()
        print("✓ SQL file executed successfully.")
    except Error as e:
        print(f"✗ MySQL Error: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("MySQL connection closed.")
