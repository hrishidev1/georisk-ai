from __future__ import annotations

from datetime import datetime, UTC

from app.models import ProcessingJob
from app.processing.enums import ProcessingStatus
from app.repositories import ProcessingJobRepository


class ProcessingJobTracker:
    """
    Handles processing job lifecycle updates.

    This centralizes job state transitions so they remain
    consistent across executors, workers and services.
    """

    def __init__(
        self,
        repository: ProcessingJobRepository,
    ) -> None:
        self._repository = repository

    # ------------------------------------------------------------------
    # Job persistence
    # ------------------------------------------------------------------

    def create_job(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        """
        Persist a new processing job.
        """
        return self._repository.create(job)

    def get_by_id(
        self,
        job_id: int,
    ) -> ProcessingJob | None:
        """
        Retrieve a processing job by ID.
        """
        return self._repository.get_by_id(job_id)

    def get_by_raster(
        self,
        raster_id: int,
    ) -> list[ProcessingJob]:
        """
        Retrieve all processing jobs for a raster.
        """
        return self._repository.get_by_raster(raster_id)

    # ------------------------------------------------------------------
    # Lifecycle transitions
    # ------------------------------------------------------------------

    def start(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        job.status = ProcessingStatus.RUNNING
        job.progress = 0
        job.started_at = datetime.now(
            UTC,
        )

        return self._repository.update(
            job,
        )

    def progress(
        self,
        job: ProcessingJob,
        progress: int,
        message: str | None = None,
    ) -> ProcessingJob:
        job.progress = max(
            0,
            min(progress, 100),
        )

        if message is not None:
            job.message = message

        return self._repository.update(
            job,
        )

    def complete(
        self,
        job: ProcessingJob,
        message: str | None = None,
    ) -> ProcessingJob:
        job.status = ProcessingStatus.COMPLETED
        job.progress = 100
        job.finished_at = datetime.now(
            UTC,
        )

        if message is not None:
            job.message = message

        return self._repository.update(
            job,
        )

    def fail(
        self,
        job: ProcessingJob,
        message: str,
    ) -> ProcessingJob:
        job.status = ProcessingStatus.FAILED
        job.finished_at = datetime.now(
            UTC,
        )
        job.message = message

        return self._repository.update(
            job,
        )

    def cancel(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        from app.exceptions.processing import ProcessingJobStateError

        if job.status in (
            ProcessingStatus.COMPLETED,
            ProcessingStatus.FAILED,
            ProcessingStatus.CANCELLED,
            ProcessingStatus.CANCELLING,
        ):
            raise ProcessingJobStateError()

        job.cancel_requested_at = datetime.now(UTC)

        if job.status in (ProcessingStatus.PENDING, ProcessingStatus.QUEUED):
            job.status = ProcessingStatus.CANCELLED
            job.message = "Job cancelled before execution."
            job.finished_at = datetime.now(UTC)
        elif job.status == ProcessingStatus.RUNNING:
            job.status = ProcessingStatus.CANCELLING
            job.message = "Cancellation requested."

        return self._repository.update(
            job,
        )

    def cancelled(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        job.status = ProcessingStatus.CANCELLED
        job.finished_at = datetime.now(
            UTC,
        )
        job.message = "Job cancelled gracefully."

        return self._repository.update(
            job,
        )

    def queue(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        job.status = ProcessingStatus.QUEUED

        return self._repository.update(
            job,
        )