from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.storage.local import LocalStorage
from app.storage.base import StorageService
from functools import lru_cache


from app.db.dependencies import get_db
from app.models import User
from app.repositories import (
    AOIRepository,
    ProjectRepository,
    RasterRepository,
    UserRepository,
)
from app.services import (
    AOIService,
    AuthService,
    ProjectAccessService,
    ProjectService,
    UserService,
    RasterService,
)

bearer_scheme = HTTPBearer(auto_error=True)


# ---------------------------------------------------------------------------
# User & Authentication
# ---------------------------------------------------------------------------

def get_user_repository(
    db: Session = Depends(get_db),
) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    repository: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(repository)

def get_auth_service(
    repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(repository)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme,
    ),
    service: AuthService = Depends(
        get_auth_service,
    ),
) -> User:
    return service.get_current_user(
        credentials.credentials,
    )


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

def get_project_repository(
    db: Session = Depends(get_db),
) -> ProjectRepository:
    return ProjectRepository(db)

def get_project_service(
    repository: ProjectRepository = Depends(get_project_repository),
) -> ProjectService:
    return ProjectService(repository)


def get_project_access_service(
    repository: ProjectRepository = Depends(
        get_project_repository,
    ),
) -> ProjectAccessService:
    return ProjectAccessService(
        repository,
    )


# ---------------------------------------------------------------------------
# AOI
# ---------------------------------------------------------------------------

def get_aoi_repository(
    db: Session = Depends(get_db),
) -> AOIRepository:
    return AOIRepository(db)


def get_aoi_service(
    repository: AOIRepository = Depends(
        get_aoi_repository,
    ),
    project_access: ProjectAccessService = Depends(
        get_project_access_service,
    ),
) -> AOIService:
    return AOIService(
        repository,
        project_access,
    )

#---------------------------------------------------------------------------
# Storage
#---------------------------------------------------------------------------

@lru_cache
def get_storage_service() -> StorageService:
    return LocalStorage(
        settings.STORAGE_ROOT,
        )

#---------------------------------------------------------------------------
# Raster
#---------------------------------------------------------------------------

def get_raster_repository(
    db: Session = Depends(get_db),
) -> RasterRepository:
    return RasterRepository(db)

def get_raster_service(
    raster_repository: RasterRepository = Depends(
        get_raster_repository,
    ),
    project_access_service: ProjectAccessService = Depends(
        get_project_access_service,
    ),
    storage_service: StorageService = Depends(
        get_storage_service,
    ),
) -> RasterService:
    return RasterService(
        repository=raster_repository,
        project_access_service=project_access_service,
        storage_service=storage_service,
    )
