"""
Application configuration.

All runtime configuration is centralized here and loaded from environment
variables (or a local .env file during development). Nothing else in the
codebase should call `os.environ` directly — every setting flows through
this single `Settings` object so there is one source of truth and one
place to validate it.
"""

from functools import lru_cache
from typing import Annotated, Any, Literal

from pydantic import AnyHttpUrl, BeforeValidator, PostgresDsn, computed_field, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[4]

def _parse_cors_origins(value: Any) -> Any:
    """
    Normalize `BACKEND_CORS_ORIGINS` from an env var into a list.

    Plain `list[AnyHttpUrl]` fields are treated as "complex" by
    pydantic-settings, which unconditionally tries `json.loads()` on the
    raw env string *before* any field validator runs — so an env value
    like `""` (unset/empty) or a comma-separated list blows up with a
    `JSONDecodeError` rather than reaching our code at all. Wrapping the
    field in `Annotated[..., BeforeValidator(...)]` (rather than
    `@field_validator`) runs this function as part of core validation
    instead, ahead of that JSON pre-parse step, so both an empty string
    and a comma-separated string are handled correctly.
    """
    if isinstance(value, str) and not value.startswith("["):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return value


class Settings(BaseSettings):
    """
    Typed, validated application settings.

    Values are resolved in this order (highest priority first):
      1. Actual environment variables (what Docker/K8s/systemd will set)
      2. A local `.env` file (developer convenience, never committed)
      3. The defaults declared below

    Using pydantic-settings (rather than `os.getenv` scattered everywhere)
    gives us fail-fast startup: if a required variable is missing or the
    wrong type, the app refuses to boot instead of failing later at
    request time.
    """

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    # --- Core app metadata ---
    PROJECT_NAME: str = "GeoRisk AI"
    API_VERSION: str = "0.1.0"
    # Renamed from ENVIRONMENT -> APP_ENV per architecture review, to avoid
    # colliding with the generic word "environment" used by tooling
    # (Docker Compose, CI, cloud providers) and to read unambiguously as
    # "which app environment is this" in logs/dashboards.
    APP_ENV: Literal["local", "staging", "production"] = "local"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # --- Security ---
    # No auth is implemented yet (still out of scope), but these three
    # belong in Settings now rather than being bolted on ad hoc later,
    # since the auth layer will need them the moment it lands and any
    # code depending on Settings should already see a stable contract.
    JWT_SECRET_KEY: str

    JWT_ALGORITHM: Literal["HS256"] = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- CORS ---
    # Accepts either a JSON array (`["https://a.com","https://b.com"]`) or
    # a plain comma-separated string (`https://a.com,https://b.com`) from
    # the environment, and tolerates being unset/empty. See
    # `_parse_cors_origins` above for why this needs `BeforeValidator`
    # rather than a regular `@field_validator`.
    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyHttpUrl] | str, BeforeValidator(_parse_cors_origins)
    ] = []

    # --- Database ---
    # Individual fields (rather than one raw URL) so Docker/K8s secrets can
    # inject each piece independently, and so we can validate each part.
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "georisk"

    # --- Storage ---
    STORAGE_ROOT: Path = Path("data")

    # --- Logging ---
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    LOG_JSON: bool = False  # True in production for structured log shipping

    @computed_field  # type: ignore[misc]
    @property
    def DATABASE_URL(self) -> str:
        """
        Build the SQLAlchemy 2.x connection string from the discrete
        POSTGRES_* fields above. Using the `psycopg` (v3) driver, which is
        the actively maintained driver and the one with first-class
        PostGIS/async support we'll lean on later.

        Renamed from SQLALCHEMY_DATABASE_URI -> DATABASE_URL per
        architecture review: the value isn't SQLAlchemy-specific (Alembic,
        health checks, and any future async engine all consume the same
        string), so the ORM-flavored name was misleading.
        """
        dsn = PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )
        return str(dsn)

    @computed_field  # type: ignore[misc]
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings accessor.

    `lru_cache` ensures the environment is parsed and validated exactly
    once per process, and every part of the app (including FastAPI's
    `Depends(get_settings)` in later stages) shares the same instance
    instead of re-reading the environment on every call.
    """
    return Settings()


settings = get_settings()
