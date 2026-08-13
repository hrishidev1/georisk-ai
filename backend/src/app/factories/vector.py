from __future__ import annotations

from app.models import Raster, VectorLayer
from app.models.enums import VectorStatus, VectorType
from app.processing.result import GeneratedVector


class VectorFactory:
    """
    Factory responsible for constructing VectorLayer models.

    Centralizes vector creation logic for generated processing outputs.
    """

    @staticmethod
    def from_generated(
        *,
        project_id: int,
        parent: Raster | None = None,
        output: GeneratedVector,
    ) -> VectorLayer:
        file_size = None
        if output.file_path.exists():
            file_size = output.file_path.stat().st_size

        return VectorLayer(
            project_id=project_id,
            parent_raster_id=parent.id if parent else None,
            name=output.name,
            description=output.description,
            artifact_type=output.artifact_type,
            status=VectorStatus.READY,
            file_path=str(output.file_path),
            geometry_type=output.geometry_type,
            crs=output.crs,
            feature_count=output.feature_count,
            file_size=file_size,
            processor=output.processor,
            processor_version=output.processor_version,
            processing_parameters=output.parameters,
        )
