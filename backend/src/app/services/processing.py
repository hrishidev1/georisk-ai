from __future__ import annotations

from pathlib import Path

from app.exceptions import RasterNotFoundError
from app.factories import RasterFactory
from app.models import (
    ProcessingJob,
    Raster,
    User,
)
from app.processing import (
    ProcessingContext,
    ProcessingManager,
    ProcessingResult,
    ProcessorType,
)
from app.processing.enums import ProcessingStatus
from app.repositories import (
    ProcessingJobRepository,
    RasterRepository,
)
from app.services.processing_job_tracker import (
    ProcessingJobTracker,
)
from app.storage.base import StorageService
from app.storage.paths import StoragePaths
from app.services.project_access import ProjectAccessService
from app.exceptions import ProcessingJobNotFoundError

from app.processing.workers import (
    ProcessingWorker,
)


class ProcessingService:
    """
    Coordinates raster processing.

    Responsible for:
    - Creating jobs
    - Executing processors
    - Persisting generated rasters
    - Tracking job lifecycle
    """

    def __init__(
        self,
        raster_repository: RasterRepository,
        job_repository: ProcessingJobRepository,
        processing_manager: ProcessingManager,
        job_tracker: ProcessingJobTracker,
        storage: StorageService,
        project_access_service: ProjectAccessService,
        worker: ProcessingWorker,
    ) -> None:
        self._rasters = raster_repository
        self._jobs = job_repository
        self._manager = processing_manager
        self._tracker = job_tracker
        self._storage = storage
        self._project_access_service = project_access_service
        self._worker = worker

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process(
        self,
        *,
        raster_id: int,
        processor: ProcessorType,
        parameters: dict[str, object],
        current_user: User,
    ) -> ProcessingJob:
        raster = self._require_raster(
            raster_id,
        )

        self._authorize_raster(
            raster,
            current_user,
        )

        job = self._create_job(
            raster=raster,
            processor=processor,
            parameters=parameters,
        )

        context = self._build_context(
            job=job,
            raster=raster,
            processor=processor,
            parameters=parameters,
            current_user=current_user,
        )
        self._worker.submit(
            job_id=job.id,
            target=self._execute_job,
            job=job,
            context=context,
        )

        return job

    def get_job(
        self,
        job_id: int,
        current_user: User,
    ) -> ProcessingJob:
        job = self._jobs.get_by_id(
            job_id,
        )

        if job is None:
            raise ProcessingJobNotFoundError()

        raster = self._require_raster(
            job.raster_id,
        )

        self._authorize_raster(
            raster,
            current_user,
        )

        return job

    def list_jobs(
        self,
        *,
        project_id: int | None = None,
        raster_id: int | None = None,
        status: ProcessingStatus | None = None,
    ) -> list[ProcessingJob]:
        return self._jobs.list(
            project_id=project_id,
            raster_id=raster_id,
            status=status,
        )

    def cancel_job(
        self,
        job_id: int,
        current_user: User,
    ) -> ProcessingJob:
        job = self.get_job(
            job_id,
            current_user,
        )

        return self._tracker.cancel(
            job,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _create_job(
        self,
        *,
        raster: Raster,
        processor: ProcessorType,
        parameters: dict[str, object],
    ) -> ProcessingJob:
        job = ProcessingJob(
            raster_id=raster.id,
            processor=processor,
            parameters=parameters,
        )

        job = self._jobs.create(
            job,
        )

        return self._tracker.queue(
            job,
        )

    def _execute_job(
        self,
        job: ProcessingJob,
        context: ProcessingContext,
    ) -> None:
        self._tracker.start(
            job,
        )

        try:
            result = self._manager.execute(
                context,
            )

            if result.status == ProcessingStatus.CANCELLED:
                self._tracker.cancelled(
                    job,
                )
                return

            self._persist_outputs(
                parent=context.raster,
                result=result,
            )

            self._tracker.complete(
                job,
                "Processing completed successfully.",
            )

        except Exception as exc:
            self._tracker.fail(
                job,
                str(exc),
            )
            raise

    def _persist_outputs(
        self,
        *,
        parent: Raster,
        result: ProcessingResult,
    ) -> None:
        for output in result.outputs:
            raster = RasterFactory.from_generated(
                parent=parent,
                output=output,
            )

            self._rasters.create(
                raster,
            )

    def _require_raster(
        self,
        raster_id: int,
    ) -> Raster:
        raster = self._rasters.get(
            raster_id,
        )

        if raster is None:
            raise RasterNotFoundError()

        return raster

    def _authorize_raster(
        self,
        raster: Raster,
        current_user: User,
    ) -> None:
        self._project_access_service.get_owned_project(
            raster.project_id,
            current_user.id,
        )

    def _build_context(
        self,
        *,
        job: ProcessingJob,
        raster: Raster,
        processor: ProcessorType,
        parameters: dict[str, object],
        current_user: User,
    ) -> ProcessingContext:
        input_path = self._storage.resolve_path(
            Path(
                raster.file_path,
            ),
        )

        return ProcessingContext(
            processor=processor,
            project_id=raster.project_id,
            raster=raster,
            current_user=current_user,
            parameters=parameters,
            input_path=input_path,
            working_directory=StoragePaths.temp(
                raster.project_id,
            ),
            output_directory=StoragePaths.outputs(
                raster.project_id,
            ),
            storage=self._storage,
            job_id=job.id,
            job_repository=self._jobs,
            progress_callback=lambda progress, message=None: self._update_progress(
                job,
                progress,
                message,
            )
        )

    def _update_progress(
        self,
        job: ProcessingJob,
        progress: int,
        message: str | None = None,
    ) -> None:
        """
        Update processing job progress and persist the changes.
        """
        job.progress = progress

        if message is not None:
            job.message = message

        self._jobs.update(
            job,
        )