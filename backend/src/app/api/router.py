from fastapi import APIRouter

from app.api.routers.aoi import router as aoi_router
from app.api.routers.auth import router as auth_router
from app.api.routers.health import router as health_router
from app.api.routers.project import router as project_router
from app.api.routers.raster import router as raster_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(project_router)
api_router.include_router(aoi_router)
api_router.include_router(raster_router)