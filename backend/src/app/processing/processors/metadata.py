from __future__ import annotations

from dataclasses import asdict

from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.enums import (
    ProcessingStatus,
    ProcessorType,
)
from app.processing.exceptions import (
    ProcessorExecutionError,
)
from app.processing.result import ProcessingResult
from app.raster import extract_metadata


class MetadataProcessor(Processor):
    """
    Extract metadata from a raster file.

    This processor does not generate any new rasters.
    It only returns metadata describing the input raster.
    """

    @property
    def name(self) -> ProcessorType:
        return ProcessorType.METADATA

    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        try:
            context.checkpoint(
                5,
                "Preparing metadata extraction...",
            )

            context.checkpoint(
                20,
                "Reading raster metadata...",
            )

            metadata = extract_metadata(
                context.input_path,
            )

            context.checkpoint(
                90,
                "Preparing processing result...",
            )

            result = ProcessingResult(
                status=ProcessingStatus.COMPLETED,
                metadata=asdict(
                    metadata,
                ),
                processor=self.name,
                processor_version=self.version,
                parameters={},
                logs=[
                    "Successfully extracted raster metadata.",
                ],
            )

            context.checkpoint(
                100,
                "Metadata extraction completed.",
            )

            return result

        except Exception as exc:
            raise ProcessorExecutionError(
                f"Failed to extract metadata from "
                f"'{context.input_path}'."
            ) from exc