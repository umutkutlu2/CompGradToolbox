import os
from typing import List
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # App port (for uvicorn server)
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database configuration with Railway support
    # Supports: DATABASE_URL, MYSQL* vars, or DB_* vars (in that order)
    def _parse_database_config(self):
        """Parse database configuration from environment variables.
        Supports Railway's MYSQL* vars, DATABASE_URL, or legacy DB_* vars.
        """
        # Try DATABASE_URL first (Railway format: mysql://user:pass@host:port/dbname)
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            try:
                parsed = urlparse(database_url)
                return {
                    "host": parsed.hostname or "localhost",
                    "port": parsed.port or 3306,
                    "user": parsed.username or "root",
                    "password": parsed.password or "",
                    "name": parsed.path.lstrip("/") if parsed.path else "TA_Assignment_System"
                }
            except Exception as e:
                print(f"Warning: Failed to parse DATABASE_URL: {e}, falling back to other vars")
        
        # Try Railway MYSQL* vars
        mysql_host = os.getenv("MYSQLHOST")
        if mysql_host:
            return {
                "host": mysql_host,
                "port": int(os.getenv("MYSQLPORT", "3306")),
                "user": os.getenv("MYSQLUSER", "root"),
                "password": os.getenv("MYSQLPASSWORD", ""),
                "name": os.getenv("MYSQLDATABASE", "TA_Assignment_System")
            }
        
        # Fall back to legacy DB_* vars
        return {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", "3306")),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", "Khalil2003"),
            "name": os.getenv("DB_NAME", "TA_Assignment_System")
        }

    _db_config = None
    
    @property
    def _db_cfg(self):
        """Lazy-load database config."""
        if self._db_config is None:
            self._db_config = self._parse_database_config()
        return self._db_config

    @property
    def DB_HOST(self) -> str:
        return self._db_cfg["host"]

    @property
    def DB_PORT(self) -> int:
        return self._db_cfg["port"]

    @property
    def DB_USER(self) -> str:
        return self._db_cfg["user"]

    @property
    def DB_PASSWORD(self) -> str:
        return self._db_cfg["password"]

    @property
    def DB_NAME(self) -> str:
        return self._db_cfg["name"]

    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    
    # CORS allowed origins - comma-separated list
    # Defaults include local dev + production domains
    # Production can override via ALLOWED_ORIGINS env var
    _allowed_origins_str: str = os.getenv(
        "ALLOWED_ORIGINS",
        "https://compgradtoolbox.online,https://www.compgradtoolbox.online,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    )
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Parse comma-separated origins string into a list, stripping whitespace."""
        return [origin.strip() for origin in self._allowed_origins_str.split(",") if origin.strip()]


settings = Settings()
