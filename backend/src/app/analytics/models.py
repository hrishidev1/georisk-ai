"""
Structured analytics event model for telemetry, audit logging, and warehouse pipelines.

Establishes a unified event schema to ensure consistent data structures across downstream
ETL pipelines, Parquet exports, and cloud analytics repositories.
"""

from datetime import datetime, timezone
from typing import Any, Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AnalyticsEvent(BaseModel):
    """
    Standard domain event model emitted by backend processing operations.
    """

    event_id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: Literal[
        "raster_uploaded",
        "raster_processed",
        "aoi_created",
        "prediction_executed",
        "workspace_exported",
    ]
    project_id: int
    user_id: int | None = None
    execution_time_ms: float | None = None
    spatial_metadata: dict[str, Any] = Field(default_factory=dict)
    properties: dict[str, Any] = Field(default_factory=dict)

    class Config:
        frozen = True
