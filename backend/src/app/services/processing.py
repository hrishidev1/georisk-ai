from __future__ import annotations

from pathlib import Path

from app.exceptions import RasterNotFoundError
from app.factories import RasterFactory, VectorFactory
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
    AOIRepository,
    ProcessingJobRepository,
    RasterRepository,
    VectorLayerRepository,
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
        vector_layer_repository: VectorLayerRepository,
        aoi_repository: AOIRepository,
        job_repository: ProcessingJobRepository,
        processing_manager: ProcessingManager,
        job_tracker: ProcessingJobTracker,
        storage: StorageService,
        project_access_service: ProjectAccessService,
        worker: ProcessingWorker,
    ) -> None:
        self._rasters = raster_repository
        self._vectors = vector_layer_repository
        self._aois = aoi_repository
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
        project_id: int | None = None,
        raster_id: int | None = None,
        processor: ProcessorType,
        parameters: dict[str, object],
        current_user: User,
    ) -> ProcessingJob:
        if raster_id is None and project_id is None:
            raise ValueError("Either raster_id or project_id must be provided")

        raster = None
        if raster_id is not None:
            raster = self._require_raster(raster_id)
            if project_id is None:
                project_id = raster.project_id
            elif raster.project_id != project_id:
                raise RasterNotFoundError(f"Raster {raster_id} not found in project {project_id}.")

        # Satisfy type checker for project_id
        assert project_id is not None

        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        job = self._create_job(
            project_id=project_id,
            raster_id=raster_id,
            processor=processor,
            parameters=parameters,
        )

        context = self._build_context(
            job=job,
            project_id=project_id,
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
        project_id: int,
        raster_id: int | None,
        processor: ProcessorType,
        parameters: dict[str, object],
    ) -> ProcessingJob:
        job = ProcessingJob(
            project_id=project_id,
            raster_id=raster_id,
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
                project_id=context.project_id,
                parent=context.raster,
                input_rasters=context.input_rasters,
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
        project_id: int,
        parent: Raster | None,
        input_rasters: list[Raster],
        result: ProcessingResult,
    ) -> None:
        from app.models.raster import RasterLineage

        for output in result.outputs:
            raster = RasterFactory.from_generated(
                project_id=project_id,
                parent=parent,
                output=output,
            )

            raster = self._rasters.create(
                raster,
            )

            # Persist multi-input provenance if parent is None (e.g. Merge)
            if parent is None and input_rasters:
                for input_r in input_rasters:
                    lineage = RasterLineage(
                        child_raster_id=raster.id,
                        parent_raster_id=input_r.id,
                    )
                    # We can use session directly through a repository, or simply add to DB.
                    # Since ProcessingService is responsible for orchestrating, we should add to session.
                    # But wait, ProcessingService uses _rasters repository which encapsulates the session.
                    # Let's add it via a new method on RasterRepository, or directly via session if accessible.
                    # _rasters.create_lineage(lineage)?
                    # Let's see if we can do self._rasters.session.add(lineage)
                    self._rasters._session.add(lineage)

                self._rasters._session.flush()

        for output in result.vector_outputs:
            vector_layer = VectorFactory.from_generated(
                project_id=project_id,
                parent=parent,
                output=output,
            )

            self._vectors.create(
                vector_layer,
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
        project_id: int,
        raster: Raster | None,
        processor: ProcessorType,
        parameters: dict[str, object],
        current_user: User,
    ) -> ProcessingContext:
        inputs_rasters = []
        input_paths = []

        # Single input raster resolution
        input_path = None
        if raster is not None:
            inputs_rasters.append(raster)
            input_path = Path(raster.file_path)
            input_paths.append(input_path)

        # Multi-input raster resolution via parameters
        if "raster_ids" in parameters:
            raster_ids = parameters["raster_ids"]
            if not isinstance(raster_ids, list):
                raise InvalidProcessingContextError("raster_ids must be a list")
            if not raster_ids:
                raise InvalidProcessingContextError("raster_ids cannot be empty")
            if len(raster_ids) < 2:
                raise InvalidProcessingContextError("At least 2 raster_ids required for merge")
            if len(set(raster_ids)) != len(raster_ids):
                raise InvalidProcessingContextError("Duplicate raster_ids are not allowed")

            inputs_rasters = []
            input_paths = []
            for rid in raster_ids:
                r = self._require_raster(rid)
                if r.project_id != project_id:
                    raise InvalidProcessingContextError(f"Raster {rid} does not belong to project {project_id}")
                inputs_rasters.append(r)
                input_paths.append(Path(r.file_path))
        # Storage resolution
        if input_path is not None:
            input_path = self._storage.resolve_path(input_path)

        resolved_input_paths = [self._storage.resolve_path(p) for p in input_paths]

        aoi_id = parameters.get("aoi_id")
        if aoi_id is not None:
            aoi = self._aois.get_by_id_and_project(aoi_id, project_id)
            if aoi is None:
                from app.exceptions import AOINotFoundError
                raise AOINotFoundError()

            from app.geo import geometry_to_feature
            feature = geometry_to_feature(aoi.geometry)
            parameters["clipping_geometry"] = feature.model_dump()

        return ProcessingContext(
            processor=processor,
            project_id=project_id,
            raster=raster,
            input_rasters=inputs_rasters,
            current_user=current_user,
            parameters=parameters,
            input_path=input_path,
            input_paths=resolved_input_paths,
            working_directory=StoragePaths.temp(
                project_id,
            ),
            output_directory=StoragePaths.outputs(
                project_id,
            ),
            storage=self._storage,
            job_id=job.id,
            job_repository=self._jobs,
            progress_callback=lambda progress, message=None: self._update_progress(
                job,
                progress,
                message,
            ),
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