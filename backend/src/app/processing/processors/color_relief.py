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
from app.raster.terrain.color_relief import (
    elevation_to_rgb,
    normalize_elevation,
)
from app.storage.paths import StoragePaths


class ColorReliefParameters(BaseModel):
    minimum: float | None = None
    maximum: float | None = None


class ColorReliefProcessor(Processor):
    """
    Generate a color relief raster from a DEM.

    The output contains three RGB bands using uint8 values.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.COLOR_RELIEF

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        try:
            context.update_progress(
                5,
                "Preparing color relief processing...",
            )

            params = ColorReliefParameters.model_validate(
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

                context.check_cancelled()

                context.update_progress(
                    50,
                    "Normalizing elevation...",
                )

                normalized = normalize_elevation(
                    dem,
                    minimum=params.minimum,
                    maximum=params.maximum,
                )

                context.check_cancelled()

                context.update_progress(
                    70,
                    "Generating color relief...",
                )

                rgb = elevation_to_rgb(
                    normalized,
                )

                context.check_cancelled()

                profile = RasterIO.copy_profile(
                    src,
                    dtype="uint8",
                    count=3,
                    compress="lzw",
                    tiled=True,
                    blockxsize=512,
                    blockysize=512,
                    nodata=None,
                )

            context.update_progress(
                85,
                "Writing color relief raster...",
            )

            RasterIO.ensure_parent_directory(
                absolute_output_path,
            )

            import rasterio

            with rasterio.open(
                absolute_output_path,
                "w",
                **profile,
            ) as dst:
                dst.write(rgb)

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
                name=f"{context.raster.name} Color Relief",
                description=(
                    f"Color relief generated from "
                    f"{context.raster.name}"
                ),
                raster_type=RasterType.COLOR_RELIEF,
                file_path=output_path,
                metadata=metadata,
                processor=self.name,
                processor_version=self.version,
                parameters=params.model_dump(),
            )

            context.update_progress(
                100,
                "Color relief processing completed.",
            )

            return ProcessingResult(
                status=ProcessingStatus.COMPLETED,
                outputs=[
                    output,
                ],
                logs=[
                    "Color relief generated successfully.",
                ],
            )

        except Exception as exc:
            if isinstance(
                exc,
                ProcessorExecutionError,
            ):
                raise

            raise ProcessorExecutionError(
                f"Failed to generate color relief from "
                f"'{context.input_path}'."
            ) from exc