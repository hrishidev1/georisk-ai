from __future__ import annotations

from pydantic import BaseModel

from app.models.enums import VectorType
from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.enums import ProcessingStatus, ProcessorType
from app.processing.exceptions import ProcessorExecutionError
from app.processing.result import GeneratedVector, ProcessingResult
from app.raster.processing.contour import create_contours
from app.storage.paths import StoragePaths


class ContourParameters(BaseModel):
    interval: float = 10.0


class ContourProcessor(Processor):
    """
    Generate contour lines from a DEM.

    The output is a GeoPackage containing contour vectors.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.CUSTOM

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        try:
            context.update_progress(
                5,
                "Preparing contour generation...",
            )

            params = ContourParameters.model_validate(
                context.parameters,
            )

            output_path = StoragePaths.generated_raster(
                project_id=context.project_id,
                processor=self.name,
                extension=".gpkg",
            )

            absolute_output_path = (
                context.storage.get_absolute_path(
                    output_path,
                )
            )

            context.update_progress(
                15,
                "Generating contours...",
            )

            result_metadata = create_contours(
                input_path=context.input_path,
                output_path=absolute_output_path,
                interval=params.interval,
            )

            context.check_cancelled()

            context.update_progress(
                90,
                "Extracting vector output metadata...",
            )

            output = GeneratedVector(
                name=f"{context.raster.name} Contours",
                description=(
                    f"Contours ({params.interval}m) generated from "
                    f"{context.raster.name}"
                ),
                artifact_type=VectorType.CONTOUR,
                file_path=output_path,
                processor=self.name,
                processor_version=self.version,
                parameters=params.model_dump(),
                geometry_type="LineString",
                crs=result_metadata.get("crs"),
                feature_count=result_metadata.get("feature_count"),
            )

            context.update_progress(
                100,
                "Contour processing completed.",
            )

            return ProcessingResult(
                status=ProcessingStatus.COMPLETED,
                outputs=[],
                vector_outputs=[
                    output,
                ],
                logs=[
                    "Contours generated successfully.",
                ],
            )

        except Exception as exc:
            if isinstance(
                exc,
                ProcessorExecutionError,
            ):
                raise

            raise ProcessorExecutionError(
                f"Failed to generate contours from "
                f"'{context.input_path}'."
            ) from exc
