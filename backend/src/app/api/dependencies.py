from functools import lru_cache

from fastapi import (
    BackgroundTasks,
    Depends,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.dependencies import get_db
from app.models import User
from app.repositories import (
    AOIRepository,
    ProcessingJobRepository,
    ProjectRepository,
    RasterRepository,
    UserRepository,
)
from app.services import (
    AOIService,
    AuthService,
    ProcessingService,
    ProjectAccessService,
    ProjectService,
    RasterService,
    UserService,
)
from app.services.processing_job_tracker import ProcessingJobTracker
from app.processing import ProcessingManager
from app.processing.factory import create_processing_manager
from app.storage import GoogleCloudStorage, LocalStorage, S3Storage, StorageService
from app.queue import LocalQueue, PubSubQueue, QueueService
from app.analytics import AnalyticsSink, BigQueryAnalyticsSink, NoOpAnalyticsSink
from app.processing.workers import (
    BackgroundWorker,
    ProcessingWorker,
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


# ---------------------------------------------------------------------------
# Infrastructure Abstractions (Storage, Queue, Analytics)
# ---------------------------------------------------------------------------

@lru_cache
def get_storage_service() -> StorageService:
    if settings.STORAGE_BACKEND == "gcs":
        return GoogleCloudStorage(
            bucket_name=settings.GCS_BUCKET_NAME,
            project_id=settings.GCP_PROJECT_ID,
        )
    if settings.STORAGE_BACKEND == "s3":
        return S3Storage(bucket_name=settings.S3_BUCKET_NAME)
    return LocalStorage(
        settings.STORAGE_ROOT,
    )

@lru_cache
def get_queue_service() -> QueueService:
    if settings.QUEUE_BACKEND == "pubsub":
        return PubSubQueue(
            project_id=settings.GCP_PROJECT_ID,
            topic_name=settings.PUBSUB_TOPIC_TASKS,
            subscription_name=settings.PUBSUB_SUBSCRIPTION_TASKS,
        )
    return LocalQueue()

@lru_cache
def get_analytics_sink() -> AnalyticsSink:
    if settings.ANALYTICS_BACKEND == "bigquery":
        return BigQueryAnalyticsSink(
            dataset_name=settings.BIGQUERY_DATASET,
            project_id=settings.GCP_PROJECT_ID,
        )
    return NoOpAnalyticsSink()


# ---------------------------------------------------------------------------
# Processing Framework
# ---------------------------------------------------------------------------

def get_processing_manager() -> ProcessingManager:
    return create_processing_manager()

def get_processing_worker(
    background_tasks: BackgroundTasks,
) -> ProcessingWorker:
    """
    Return the worker responsible for executing processing jobs.

    Currently uses FastAPI BackgroundTasks.

    Future implementations may return CeleryWorker,
    PubSubWorker or SparkWorker without changing
    ProcessingService.
    """
    return BackgroundWorker(
        background_tasks,
    )

def get_processing_job_repository(
    db: Session = Depends(get_db),
) -> ProcessingJobRepository:
    return ProcessingJobRepository(db)


def get_processing_job_tracker(
    repository: ProcessingJobRepository = Depends(
        get_processing_job_repository,
    ),
) -> ProcessingJobTracker:
    return ProcessingJobTracker(
        repository,
    )


# ---------------------------------------------------------------------------
# Raster
# ---------------------------------------------------------------------------

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
    processing_manager: ProcessingManager = Depends(
        get_processing_manager,
    ),
    processing_tracker: ProcessingJobTracker = Depends(
        get_processing_job_tracker,
    ),
) -> RasterService:
    return RasterService(
        repository=raster_repository,
        project_access_service=project_access_service,
        storage_service=storage_service,
        processing_manager=processing_manager,
        processing_tracker=processing_tracker,
    )


# ---------------------------------------------------------------------------
# Processing Service
# ---------------------------------------------------------------------------

def get_processing_service(
    raster_repository: RasterRepository = Depends(
        get_raster_repository,
    ),
    processing_job_repository: ProcessingJobRepository = Depends(
        get_processing_job_repository,
    ),
    processing_manager: ProcessingManager = Depends(
        get_processing_manager,
    ),
    processing_job_tracker: ProcessingJobTracker = Depends(
        get_processing_job_tracker,
    ),
    storage_service: StorageService = Depends(
        get_storage_service,
    ),
    project_access_service: ProjectAccessService = Depends(
        get_project_access_service,
    ),
    worker: ProcessingWorker = Depends(
        get_processing_worker,
    ),
) -> ProcessingService:
    return ProcessingService(
        raster_repository=raster_repository,
        job_repository=processing_job_repository,
        processing_manager=processing_manager,
        job_tracker=processing_job_tracker,
        storage=storage_service,
        project_access_service=project_access_service,
        worker=worker,
    )