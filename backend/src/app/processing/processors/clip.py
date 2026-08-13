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
from app.raster.processing.clip import create_clip
from app.storage.paths import StoragePaths
from app.models import RasterType


class ClipProcessor(Processor):
    """
    Clip a raster based on an Area of Interest (AOI).
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.CLIP

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        context.checkpoint(
            5,
            "Preparing clip processing...",
        )

        if "clipping_geometry" not in context.parameters:
            raise InvalidProcessingContextError(
                "Missing 'clipping_geometry' in processing parameters."
            )

        geometry = context.parameters["clipping_geometry"]

        output_path = StoragePaths.generated_raster(
            project_id=context.project_id,
            processor=self.name,
        )

        absolute_output_path = context.storage.get_absolute_path(
            output_path,
        )

        context.checkpoint(
            15,
            "Clipping raster...",
        )

        metadata = create_clip(
            input_path=context.input_path,
            output_path=absolute_output_path,
            geometry=geometry,
        )

        context.checkpoint(
            90,
            "Creating raster record...",
        )

        # Retain provenance by keeping original parameters
        # but avoid duplicating the massive geometry string
        # if we only want to store the aoi_id for provenance.
        # Wait, the instruction says:
        # "Avoid storing unnecessarily large geometry blobs in processing_parameters
        # if the existing architecture does not do so."
        # We can copy the parameters and remove clipping_geometry for the output record.
        record_params = context.parameters.copy()
        record_params.pop("clipping_geometry", None)

        output = GeneratedRaster(
            name=f"{context.raster.name} Clipped",
            description=(
                f"Clipped from {context.raster.name}"
            ),
            # The clip processor should output the same type as input conceptually,
            # or maybe there's a specific RasterType? The instruction says:
            # "Only modify ProcessorType if... If an enum modification is genuinely required... do not create a migration speculatively."
            # Existing RasterType enum has DEM, SATELLITE, LAND_COVER, SLOPE, ASPECT, HILLSHADE, COLOR_RELIEF, PREDICTION, UNCERTAINTY, OTHER.
            # Clip is an operation, it doesn't change the underlying physical meaning of the raster.
            # E.g., clipping a DEM produces a DEM.
            raster_type=context.raster.type,
            file_path=output_path,
            processor=self.name,
            processor_version=self.version,
            parameters=record_params,
            metadata=metadata,
        )

        context.checkpoint(
            100,
            "Clip processing completed.",
        )

        return ProcessingResult(
            status=ProcessingStatus.COMPLETED,
            outputs=[
                output,
            ],
            logs=[
                "Raster clipped successfully.",
            ],
        )
