from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import Raster, User
    from app.repositories import ProcessingJobRepository

from app.processing.enums import ProcessorType
from app.storage.base import StorageService
from collections.abc import Callable


@dataclass(slots=True, frozen=True)
class ProcessingContext:
    """
    Immutable context passed to every processor.

    It contains everything required to execute a processing
    operation without exposing repositories or database logic.
    """

    # ------------------------------------------------------------------
    # Processing information
    # ------------------------------------------------------------------

    processor: ProcessorType

    project_id: int

    raster: Raster

    current_user: User

    # ------------------------------------------------------------------
    # File locations
    # ------------------------------------------------------------------

    input_path: Path

    working_directory: Path

    output_directory: Path

    # ------------------------------------------------------------------
    # Services
    # ------------------------------------------------------------------

    storage: StorageService

    # ------------------------------------------------------------------
    # Processor parameters
    # ------------------------------------------------------------------

    parameters: dict[str, Any] = field(
        default_factory=dict,
    )

    # ------------------------------------------------------------------
    # Tracking
    # ------------------------------------------------------------------

    job_id: int | None = None

    progress_callback: Callable[[int, str | None], None] | None = None

    job_repository: "ProcessingJobRepository | None" = None

    def check_cancelled(
        self,
    ) -> None:
        """
        Raise an exception if the current job has been cancelled.
        """
        if self.job_repository is None or self.job_id is None:
            return

        job = self.job_repository.get_by_id(
            self.job_id,
        )

        if job is None:
            return
            
        from app.processing.enums import ProcessingStatus
        from app.processing.exceptions import ProcessingCancelledError

        if job.status in (
            ProcessingStatus.CANCELLING,
            ProcessingStatus.CANCELLED,
        ):
            raise ProcessingCancelledError()

    def update_progress(
        self,
        progress: int,
        message: str | None = None,
    ) -> None:
        if self.progress_callback:
            self.progress_callback(progress, message)

    def checkpoint(
        self,
        progress: int,
        message: str | None = None,
    ) -> None:
        self.update_progress(progress, message)
        self.check_cancelled()