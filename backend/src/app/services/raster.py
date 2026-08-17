from __future__ import annotations

from pathlib import Path
from typing import BinaryIO
from uuid import uuid4

from app.exceptions import RasterNotFoundError
from app.exceptions.processing import ProcessingJobNotFoundError
from app.models import (
    Raster,
    RasterSource,
    RasterStatus,
    User,
    ProcessingJob,
)
from app.processing import ProcessingContext, ProcessingManager
from app.services.processing_job_tracker import ProcessingJobTracker
from app.schemas.processing import ProcessingRequest
from app.raster import (
    extract_metadata,
    validate_raster,
)
from app.raster.models import RasterMetadata
from app.repositories import RasterRepository
from app.schemas.raster import (
    RasterCreate,
    RasterPointInspectionResponse,
    RasterStatisticsResponse,
    RasterUpdate,
)
from app.services.project_access import ProjectAccessService
from app.storage.base import StorageService
from app.storage.paths import StoragePaths
from app.factories import RasterFactory
from app.raster.preview import RasterPreview


class RasterService:
    """
    Responsible only for raster lifecycle management.

    Responsibilities
    ----------------
    • Upload
    • Validation
    • Metadata extraction
    • CRUD

    Raster processing (Hillshade, Slope, AI, etc.)
    is handled by ProcessingService.
    """

    def __init__(
        self,
        repository: RasterRepository,
        project_access_service: ProjectAccessService,
        storage_service: StorageService,
        processing_manager: ProcessingManager,
        processing_tracker: ProcessingJobTracker,
    ) -> None:
        self._repository = repository
        self._project_access_service = project_access_service
        self._storage = storage_service
        self._processing_manager = processing_manager
        self._processing_tracker = processing_tracker

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _require_raster(
        self,
        project_id: int,
        raster_id: int,
    ) -> Raster:
        raster = self._repository.get_by_id_and_project(
            raster_id=raster_id,
            project_id=project_id,
        )

        if raster is None:
            raise RasterNotFoundError()

        return raster

    def _build_storage_path(
        self,
        project_id: int,
        filename: str,
    ) -> Path:
        extension = Path(filename).suffix.lower()

        return StoragePaths.raster_upload(
            project_id=project_id,
            raster_id=uuid4(),
            extension=extension,
        )

    

    # ------------------------------------------------------------------
    # Upload
    # ------------------------------------------------------------------

    def create_uploaded_raster(
        self,
        project_id: int,
        file: BinaryIO,
        filename: str,
        raster: RasterCreate,
        current_user: User,
        parent_raster_id: int | None = None,
    ) -> Raster:
        """
        Upload a raster and register it.

        Workflow

        Upload
            ↓
        Storage
            ↓
        Validation
            ↓
        Metadata Extraction
            ↓
        Database
        """

        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        destination = self._build_storage_path(
            project_id,
            filename,
        )

        stored_path = self._storage.save(
            file=file,
            destination=destination,
        )

        try:
            validate_raster(
                stored_path,
            )

            metadata = extract_metadata(
                stored_path,
            )

            raster_model = RasterFactory.from_upload(
                project_id=project_id,
                destination=destination,
                metadata=metadata,
                raster=raster,
                parent_raster_id=parent_raster_id,
            )

            return self._repository.create(
                raster_model,
            )

        except Exception:
            self._storage.delete(
                destination,
            )
            raise

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def list(
        self,
        project_id: int,
        current_user: User,
    ) -> list[Raster]:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        return self._repository.get_by_project(
            project_id,
        )

    def get(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> Raster:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        return self._require_raster(
            project_id,
            raster_id,
        )

    def update(
        self,
        project_id: int,
        raster_id: int,
        raster_update: RasterUpdate,
        current_user: User,
    ) -> Raster:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        raster = self._require_raster(
            project_id,
            raster_id,
        )

        updates = raster_update.model_dump(
            exclude_unset=True,
        )

        for field, value in updates.items():
            setattr(
                raster,
                field,
                value,
            )

        return self._repository.update(
            raster,
        )

    def delete(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> None:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        raster = self._require_raster(
            project_id,
            raster_id,
        )

        self._storage.delete(
            Path(raster.file_path),
        )

        self._repository.delete(
            raster,
        )

    # ------------------------------------------------------------------
    # Preview and Statistics
    # ------------------------------------------------------------------

    def get_preview(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> bytes:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )
        raster = self._require_raster(project_id, raster_id)
        resolved_path = self._storage.resolve_path(Path(raster.file_path))
        if not resolved_path.exists():
            raise RasterNotFoundError()

        return RasterPreview.generate_preview(resolved_path)

    def get_thumbnail(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> bytes:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )
        raster = self._require_raster(project_id, raster_id)
        resolved_path = self._storage.resolve_path(Path(raster.file_path))
        if not resolved_path.exists():
            raise RasterNotFoundError()

        return RasterPreview.generate_thumbnail(resolved_path)

    def get_statistics(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> RasterStatisticsResponse:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )
        raster = self._require_raster(project_id, raster_id)
        resolved_path = self._storage.resolve_path(Path(raster.file_path))
        if not resolved_path.exists():
            raise RasterNotFoundError()

        stats = RasterPreview.extract_statistics(resolved_path)
        return RasterStatisticsResponse(bands=stats)

    def inspect_point(
        self,
        project_id: int,
        raster_id: int,
        lon: float,
        lat: float,
        current_user: User,
    ) -> RasterPointInspectionResponse:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )
        raster = self._require_raster(project_id, raster_id)
        resolved_path = self._storage.resolve_path(Path(raster.file_path))
        if not resolved_path.exists():
            raise RasterNotFoundError()

        data = RasterPreview.inspect_point(resolved_path, lon, lat)
        return RasterPointInspectionResponse(**data)

    # ------------------------------------------------------------------
    # Processing
    # ------------------------------------------------------------------

    def submit_processing_job(
        self,
        project_id: int,
        raster_id: int,
        request: ProcessingRequest,
        current_user: User,
    ) -> ProcessingJob:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        raster = self._require_raster(
            project_id,
            raster_id,
        )

        # Create a new ProcessingJob in DB via tracker
        job = ProcessingJob(
            raster_id=raster_id,
            processor=request.processor,
            parameters=request.parameters,
            processor_version="1.0.0",
            executor=self._processing_manager.executor_name,
        )
        job = self._processing_tracker.create_job(job)
        job = self._processing_tracker.queue(job)

        # Currently synchronous execution — in production, this sends to QueueService
        context = ProcessingContext(
            processor=request.processor,
            project_id=project_id,
            raster=raster,
            current_user=current_user,
            input_path=Path(raster.file_path),
            working_directory=StoragePaths.temporary(f"job_{job.id}"),
            output_directory=StoragePaths.raster_directory(project_id) / "generated",
            storage=self._storage,
            parameters=request.parameters,
            job_id=job.id,
        )

        self._processing_tracker.start(job)
        try:
            result = self._processing_manager.execute(context)
            job = self._processing_tracker.complete(job, "\n".join(result.logs))
        except Exception as e:
            job = self._processing_tracker.fail(job, str(e))
        
        return job

    def list_processing_jobs(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> dict[str, list[ProcessingJob]]:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        jobs = self._processing_tracker.get_by_raster(raster_id)
        return {"jobs": jobs}

    def get_processing_job(
        self,
        project_id: int,
        raster_id: int,
        job_id: int,
        current_user: User,
    ) -> ProcessingJob:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        job = self._processing_tracker.get_by_id(job_id)
        if not job or job.raster_id != raster_id:
            raise ProcessingJobNotFoundError()
        return job