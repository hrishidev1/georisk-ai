"""
Logging configuration.

We configure Python's standard `logging` module directly (via `dictConfig`)
rather than pulling in a third-party logging framework. Standard `logging`
is what Uvicorn, SQLAlchemy, and Alembic all emit through already, so
configuring it once here means every library in the stack is captured
consistently instead of having two parallel logging systems.
"""

import logging
import sys
from logging.config import dictConfig

from app.core.config import settings


def _build_log_config() -> dict:
    """
    Two formatters are provided:
      - "console": human-readable, used for local development.
      - "json": single-line structured records, used in staging/production
        so logs are easy to ship into ELK/Loki/CloudWatch and query.

    Which one is active is controlled by `LOG_JSON` in Settings, not
    hardcoded, so the same image behaves correctly in every environment.
    """
    formatter = "json" if settings.LOG_JSON else "console"

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "console": {
                "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "()": "logging.Formatter",
                "format": (
                    '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
                    '"logger": "%(name)s", "message": "%(message)s"}'
                ),
                "datefmt": "%Y-%m-%dT%H:%M:%S%z",
            },
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": formatter,
                "stream": sys.stdout,
            },
        },
        "root": {
            "handlers": ["default"],
            "level": settings.LOG_LEVEL,
        },
        "loggers": {
            # Quiet down noisy third-party loggers without silencing our own.
            "uvicorn.access": {"level": settings.LOG_LEVEL, "propagate": True},
            "sqlalchemy.engine": {
                # Only surface raw SQL at DEBUG, otherwise it floods logs.
                "level": "INFO" if settings.LOG_LEVEL != "DEBUG" else "DEBUG",
                "propagate": True,
            },
        },
    }


def configure_logging() -> None:
    """Apply the logging configuration. Call once, at process startup."""
    dictConfig(_build_log_config())


logger = logging.getLogger(__name__)  # module-level logger for this file
