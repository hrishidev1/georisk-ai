from __future__ import annotations

from pathlib import Path

from app.models import (
    Raster,
    RasterSource,
    RasterStatus,
)
from app.processing.result import GeneratedRaster
from app.raster.models import RasterMetadata
from app.schemas.raster import RasterCreate


class RasterFactory:
    """
    Factory responsible for constructing Raster models.

    Centralizes raster creation logic for uploads and
    generated processing outputs.
    """

    @staticmethod
    def from_upload(
        *,
        project_id: int,
        destination: Path,
        metadata: RasterMetadata,
        raster: RasterCreate,
        parent_raster_id: int | None = None,
    ) -> Raster:
        return Raster(
            project_id=project_id,
            parent_raster_id=parent_raster_id,
            name=raster.name,
            description=raster.description,
            type=raster.type,
            source=RasterSource.UPLOADED,
            status=RasterStatus.READY,
            file_path=str(destination),
            crs=metadata.crs,
            width=metadata.width,
            height=metadata.height,
            band_count=metadata.band_count,
            pixel_size_x=metadata.pixel_size_x,
            pixel_size_y=metadata.pixel_size_y,
            min_x=metadata.min_x,
            min_y=metadata.min_y,
            max_x=metadata.max_x,
            max_y=metadata.max_y,
            file_size=metadata.file_size,
        )

    @staticmethod
    def from_generated(
        *,
        parent: Raster,
        output: GeneratedRaster,
    ) -> Raster:
        metadata = output.metadata

        return Raster(
            project_id=parent.project_id,
            parent_raster_id=parent.id,
            name=output.name,
            description=output.description,
            type=output.raster_type,
            source=RasterSource.GENERATED,
            status=RasterStatus.READY,
            file_path=str(output.file_path),
            crs=metadata.crs if metadata else None,
            width=metadata.width if metadata else None,
            height=metadata.height if metadata else None,
            band_count=metadata.band_count if metadata else None,
            pixel_size_x=metadata.pixel_size_x if metadata else None,
            pixel_size_y=metadata.pixel_size_y if metadata else None,
            min_x=metadata.min_x if metadata else None,
            min_y=metadata.min_y if metadata else None,
            max_x=metadata.max_x if metadata else None,
            max_y=metadata.max_y if metadata else None,
            file_size=metadata.file_size if metadata else None,
            processor=output.processor,
            processor_version=output.processor_version,
            processing_parameters=output.parameters,
        )