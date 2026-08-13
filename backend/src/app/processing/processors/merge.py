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
from app.raster.processing.merge import create_merge
from app.storage.paths import StoragePaths


class MergeProcessor(Processor):
    """
    Merge multiple rasters into a single raster.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.MERGE

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        context.checkpoint(
            5,
            "Preparing merge processing...",
        )

        if not context.input_paths or len(context.input_paths) < 2:
            raise InvalidProcessingContextError(
                "Merge requires at least two input rasters."
            )

        if not context.input_rasters or len(context.input_rasters) < 2:
            raise InvalidProcessingContextError(
                "Merge requires at least two input rasters in context."
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
            "Merging rasters...",
        )

        metadata = create_merge(
            input_paths=context.input_paths,
            output_path=absolute_output_path,
        )

        context.checkpoint(
            90,
            "Creating raster record...",
        )

        record_params = context.parameters.copy()
        record_params["input_raster_ids"] = [r.id for r in context.input_rasters]

        output_raster_type = context.input_rasters[0].type

        output = GeneratedRaster(
            name="Merged Raster",
            description=f"Merged from {len(context.input_rasters)} rasters",
            raster_type=output_raster_type,
            file_path=output_path,
            processor=self.name,
            processor_version=self.version,
            parameters=record_params,
            metadata=metadata,
        )

        context.checkpoint(
            100,
            "Merge processing completed.",
        )

        return ProcessingResult(
            status=ProcessingStatus.COMPLETED,
            outputs=[
                output,
            ],
            logs=[
                "Rasters merged successfully.",
            ],
        )
