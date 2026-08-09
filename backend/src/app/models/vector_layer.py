from __future__ import annotations

from enum import Enum

from sqlalchemy import (
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.timestampedmodel import TimestampedModel
from app.processing.enums import ProcessorType
from app.models.enums import VectorType, VectorStatus


class VectorLayer(TimestampedModel):
    __tablename__ = "vector_layers"

    __table_args__ = (
        Index("ix_vector_layers_project_status", "project_id", "status"),
        Index("ix_vector_layers_project_parent", "project_id", "parent_raster_id"),
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey(
            "projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    parent_raster_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "rasters.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    artifact_type: Mapped[VectorType] = mapped_column(
        SqlEnum(VectorType),
        nullable=False,
    )

    status: Mapped[VectorStatus] = mapped_column(
        SqlEnum(VectorStatus),
        nullable=False,
        default=VectorStatus.READY,
    )

    file_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        unique=True,
    )

    geometry_type: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    crs: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    feature_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    file_size: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    processor: Mapped[ProcessorType | None] = mapped_column(
        SqlEnum(
            ProcessorType,
            name="processor_type",
        ),
        nullable=True,
    )

    processor_version: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    processing_parameters: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    project: Mapped["Project"] = relationship()

    parent_raster: Mapped["Raster | None"] = relationship()
