from fastapi import APIRouter

from app.api.routers import (
    aoi,
    auth,
    health,
    project,
    users,
)

api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    project.router,
    prefix="/projects",
    tags=["Projects"],
)

api_router.include_router(
    aoi.router,
    prefix="/projects/{project_id}/aois",
    tags=["Areas of Interest"],
)