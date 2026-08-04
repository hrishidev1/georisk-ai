"""
SQLAlchemy engine and session factory.

We use the synchronous `psycopg` (v3) driver for now. Psycopg3 supports
both sync and async out of the box, so if/when the API layer needs async
endpoints later, we can switch to `create_async_engine` with
`postgresql+psycopg` without changing drivers — that migration is
deliberately deferred, not blocked.

No FastAPI dependency (e.g. `get_db`) is defined here yet, since routing
and endpoints are out of scope for this step. This module only exposes
the engine and a session factory for whoever wires that up next.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

from collections.abc import Generator
from sqlalchemy.orm import Session

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # detects and recycles dropped/stale connections
    echo=settings.DEBUG,  # mirrors DEBUG so local dev can see SQL, prod stays quiet
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)