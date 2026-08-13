from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.processing.enums import (
    ProcessingStatus,
    ProcessorType,
)


class ProcessingJob(Base):
    """
    Represents a raster processing task.

    Examples:
        Metadata
        Hillshade
        Slope
        AI Prediction
    """

    __tablename__ = "processing_jobs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey(
            "projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    raster_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "rasters.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    processor: Mapped[ProcessorType] = mapped_column(
        Enum(
            ProcessorType,
            name="processor_type",
        ),
        nullable=False,
    )

    status: Mapped[ProcessingStatus] = mapped_column(
        Enum(
            ProcessingStatus,
            name="processing_status",
        ),
        default=ProcessingStatus.PENDING,
        nullable=False,
        index=True,
    )

    progress: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )

    processor_version: Mapped[str] = mapped_column(
        String(32),
        default="1.0.0",
        nullable=False,
    )

    message: Mapped[str | None] = mapped_column(
        Text,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    cancel_requested_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    raster: Mapped["Raster"] = relationship(
        back_populates="processing_jobs",
    )

    executor: Mapped[str] = mapped_column(
        String(32),
        default="local",
        nullable=False,
    )

    parameters: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )