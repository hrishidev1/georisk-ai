from __future__ import annotations

from enum import Enum

from sqlalchemy import (
    Enum as SqlEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

from app.models.timestampedmodel import TimestampedModel

from app.models.enums import (
    RasterSource,
    RasterStatus,
    RasterType,
)
from app.processing.enums import ProcessorType

class RasterLineage(Base):
    __tablename__ = "raster_lineage"

    child_raster_id: Mapped[int] = mapped_column(
        ForeignKey(
            "rasters.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    parent_raster_id: Mapped[int] = mapped_column(
        ForeignKey(
            "rasters.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )


class Raster(TimestampedModel):
    __tablename__ = "rasters"

    __table_args__ = (
        Index("ix_rasters_project_status", "project_id", "status"),
        Index("ix_rasters_project_parent", "project_id", "parent_raster_id"),
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

    type: Mapped[RasterType] = mapped_column(
        SqlEnum(RasterType),
        nullable=False,
    )

    source: Mapped[RasterSource] = mapped_column(
        SqlEnum(RasterSource),
        nullable=False,
        default=RasterSource.UPLOADED,
    )

    status: Mapped[RasterStatus] = mapped_column(
        SqlEnum(RasterStatus),
        nullable=False,
        default=RasterStatus.UPLOADING,
    )

    file_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        unique=True,
    )

    crs: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    width: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    height: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    band_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    pixel_size_x: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    pixel_size_y: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    min_x: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    min_y: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    max_x: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    max_y: Mapped[float | None] = mapped_column(
        Float,
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

    project: Mapped["Project"] = relationship(
        back_populates="rasters",
    )

    parent: Mapped["Raster | None"] = relationship(
        remote_side="Raster.id",
        back_populates="children",
    )

    children: Mapped[list["Raster"]] = relationship(
        back_populates="parent",
    )

    processing_jobs: Mapped[list["ProcessingJob"]] = relationship(
        back_populates="raster",
        cascade="all, delete-orphan",
    )