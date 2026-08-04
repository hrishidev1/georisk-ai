"""
Health check endpoint(s).

Kept as its own router (rather than a route directly on the `app` object
in main.py) so the api/ package is the single place every HTTP-facing
concern lives — this is the first router, and every future one (once
endpoints are in scope) follows the same pattern: build an `APIRouter`
here, include it in `main.py`.
"""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["System"],
)


class HealthResponse(BaseModel):
    """Response shape for the liveness probe."""

    status: Literal["ok"]
    project: str
    environment: str
    version: str
    
@router.get("/", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """
    Liveness/readiness probe.

    Deliberately has no DB dependency yet (models/session wiring into
    endpoints is out of scope today) — it only confirms the process is
    up and configuration loaded successfully. A `/health/db` variant can
    be added once the endpoint layer is built.
    """
    return HealthResponse(
        status="ok",
        project=settings.PROJECT_NAME,
        environment=settings.APP_ENV,
        version=settings.API_VERSION,
    )
