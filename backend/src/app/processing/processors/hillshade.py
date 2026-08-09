from __future__ import annotations

from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.enums import (
    ProcessingStatus,
    ProcessorType,
)
from app.processing.result import (
    GeneratedRaster,
    ProcessingResult,
)
from app.raster.processing.hillshade import create_hillshade
from app.storage.paths import StoragePaths
from app.models import RasterType
from pydantic import BaseModel


class HillshadeParameters(BaseModel):
    azimuth: float = 315.0
    altitude: float = 45.0
    z_factor: float = 1.0


class HillshadeProcessor(Processor):
    """
    Generate a hillshade raster from a DEM.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.HILLSHADE

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        context.checkpoint(
            5,
            "Preparing hillshade processing...",
        )

        output_path = StoragePaths.generated_raster(
            project_id=context.project_id,
            processor=self.name,
        )

        absolute_output_path = context.storage.get_absolute_path(
            output_path,
        )

        params = HillshadeParameters.model_validate(
            context.parameters,
        )

        context.checkpoint(
            15,
            "Reading DEM...",
        )

        metadata = create_hillshade(
            input_path=context.input_path,
            output_path=absolute_output_path,
            azimuth=params.azimuth,
            altitude=params.altitude,
            z_factor=params.z_factor,
        )

        context.checkpoint(
            90,
            "Creating raster record...",
        )

        output = GeneratedRaster(
            name=f"{context.raster.name} Hillshade",
            description=(
                f"Hillshade generated from "
                f"{context.raster.name}"
            ),
            raster_type=RasterType.HILLSHADE,
            file_path=output_path,
            processor=self.name,
            processor_version=self.version,
            parameters=params.model_dump(),
            metadata=metadata,
        )

        context.checkpoint(
            100,
            "Hillshade processing completed.",
        )

        return ProcessingResult(
            status=ProcessingStatus.COMPLETED,
            outputs=[
                output,
            ],
            logs=[
                "Hillshade generated successfully.",
            ],
        )