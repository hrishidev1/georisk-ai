from __future__ import annotations

from pydantic import BaseModel

from app.models import RasterType
from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.enums import ProcessingStatus, ProcessorType
from app.processing.exceptions import ProcessorExecutionError
from app.processing.result import GeneratedRaster, ProcessingResult
from app.raster import extract_metadata
from app.raster.io import RasterIO
from app.raster.terrain.analysis import (
    calculate_gradients,
    calculate_slope,
)
from app.storage.paths import StoragePaths


class SlopeParameters(BaseModel):
    z_factor: float = 1.0


class SlopeProcessor(Processor):
    """
    Generate a slope raster from a DEM.

    The output contains slope values in degrees as Float32.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.SLOPE

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        try:
            context.update_progress(
                5,
                "Preparing slope processing...",
            )

            params = SlopeParameters.model_validate(
                context.parameters,
            )

            output_path = StoragePaths.generated_raster(
                project_id=context.project_id,
                processor=self.name,
            )

            absolute_output_path = (
                context.storage.get_absolute_path(
                    output_path,
                )
            )

            context.update_progress(
                15,
                "Reading DEM...",
            )

            with RasterIO.open(
                context.input_path,
            ) as src:
                dem = RasterIO.read_band(
                    src,
                    dtype="float32",
                )

                x_res, y_res = RasterIO.resolution(
                    src,
                )

                context.check_cancelled()

                context.update_progress(
                    40,
                    "Calculating terrain gradients...",
                )

                dx, dy = calculate_gradients(
                    dem,
                    x_res,
                    y_res,
                    z_factor=params.z_factor,
                )

                context.check_cancelled()

                context.update_progress(
                    70,
                    "Calculating slope...",
                )

                slope = calculate_slope(
                    dx,
                    dy,
                )

                context.check_cancelled()

                profile = RasterIO.copy_profile(
                    src,
                    dtype="float32",
                    count=1,
                    compress="lzw",
                    tiled=True,
                    blockxsize=512,
                    blockysize=512,
                    nodata=None,
                )

            context.update_progress(
                85,
                "Writing slope raster...",
            )

            RasterIO.write(
                output_path=absolute_output_path,
                data=slope,
                profile=profile,
            )

            context.check_cancelled()

            context.update_progress(
                90,
                "Extracting output metadata...",
            )

            metadata = extract_metadata(
                absolute_output_path,
            )

            context.check_cancelled()

            output = GeneratedRaster(
                name=f"{context.raster.name} Slope",
                description=(
                    f"Slope generated from "
                    f"{context.raster.name}"
                ),
                raster_type=RasterType.SLOPE,
                file_path=output_path,
                metadata=metadata,
                processor=self.name,
                processor_version=self.version,
                parameters=params.model_dump(),
            )

            context.update_progress(
                100,
                "Slope processing completed.",
            )

            return ProcessingResult(
                status=ProcessingStatus.COMPLETED,
                outputs=[
                    output,
                ],
                logs=[
                    "Slope generated successfully.",
                ],
            )

        except Exception as exc:
            if isinstance(
                exc,
                ProcessorExecutionError,
            ):
                raise

            raise ProcessorExecutionError(
                f"Failed to generate slope from "
                f"'{context.input_path}'."
            ) from exc