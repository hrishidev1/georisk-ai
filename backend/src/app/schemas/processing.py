from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.processing.enums import (
    ProcessingStatus,
    ProcessorType,
)


class ProcessingRequest(BaseModel):
    """
    Request to execute a processor.
    """

    raster_id: int

    processor: ProcessorType

    parameters: dict[str, Any] = Field(
        default_factory=dict,
    )

class ProcessingJobResponse(BaseModel):
    """
    Processing job response.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    raster_id: int

    processor: ProcessorType

    status: ProcessingStatus

    progress: int

    parameters: dict[str, Any] | None

    processor_version: str

    executor: str

    message: str | None

    started_at: datetime | None

    finished_at: datetime | None

    created_at: datetime

    updated_at: datetime


class ProcessingJobListResponse(BaseModel):
    """
    List of processing jobs.
    """

    jobs: list[ProcessingJobResponse]