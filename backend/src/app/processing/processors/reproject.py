from __future__ import annotations

from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.enums import (
    ProcessingStatus,
    ProcessorType,
)
from app.processing.exceptions import InvalidProcessingContextError
from app.processing.result import (
    GeneratedRaster,
    ProcessingResult,
)
from app.raster.processing.reproject import create_reproject
from app.storage.paths import StoragePaths


class ReprojectProcessor(Processor):
    """
    Reproject a raster to a specified target CRS.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.REPROJECT

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        context.checkpoint(
            5,
            "Preparing reproject processing...",
        )

        if "target_crs" not in context.parameters:
            raise InvalidProcessingContextError(
                "Missing 'target_crs' in processing parameters."
            )

        target_crs = str(context.parameters["target_crs"])
        resampling_method = str(context.parameters.get("resampling_method", "nearest"))

        if context.input_path is None or context.raster is None:
            raise InvalidProcessingContextError(
                "Reproject requires a valid single input raster."
            )

        output_path = StoragePaths.generated_raster(
            project_id=context.project_id,
            processor=self.name,
        )

        absolute_output_path = context.storage.get_absolute_path(
            output_path,
        )

        context.checkpoint(
            15,
            f"Reprojecting raster to {target_crs}...",
        )

        metadata = create_reproject(
            input_path=context.input_path,
            output_path=absolute_output_path,
            target_crs=target_crs,
            resampling_method=resampling_method,
        )

        context.checkpoint(
            90,
            "Creating raster record...",
        )

        output = GeneratedRaster(
            name=f"{context.raster.name} Reprojected ({target_crs})",
            description=f"Reprojected from {context.raster.name} to {target_crs}",
            raster_type=context.raster.type,
            file_path=output_path,
            processor=self.name,
            processor_version=self.version,
            parameters=context.parameters.copy(),
            metadata=metadata,
        )

        context.checkpoint(
            100,
            "Reproject processing completed.",
        )

        return ProcessingResult(
            status=ProcessingStatus.COMPLETED,
            outputs=[
                output,
            ],
            logs=[
                "Raster reprojected successfully.",
            ],
        )
