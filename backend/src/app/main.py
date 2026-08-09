"""
Application entry point.

This wires together configuration, logging, and routers, and exposes the
ASGI `app` object that Uvicorn serves. No auth or business logic lives
here by design — this module only assembles the app; each concern (health,
and every future endpoint group) is defined in its own module under
`app/api/` and mounted here.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging, logger
from app.exceptions.handlers import register_exception_handlers
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown hook (replaces the deprecated `@app.on_event`).

    Logging is configured here, at process startup, rather than at import
    time, so it runs exactly once when the server actually starts (not
    every time the module is imported, e.g. by a test runner or Alembic).
    """
    configure_logging()
    logger.info(
        "Starting %s v%s [env=%s, debug=%s]",
        settings.PROJECT_NAME,
        settings.API_VERSION,
        settings.APP_ENV,
        settings.DEBUG,
    )
    yield
    logger.info("Shutting down %s", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    # Sourced from Settings rather than hardcoded, so the version reported
    # in /docs and /openapi.json always matches API_VERSION in config —
    # one place to bump on release, not two.
    version=settings.API_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)