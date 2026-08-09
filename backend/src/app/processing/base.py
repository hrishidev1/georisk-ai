from __future__ import annotations

from abc import ABC, abstractmethod

from app.processing.context import ProcessingContext
from app.processing.enums import ProcessorType
from app.processing.result import ProcessingResult


class Processor(ABC):
    """
    Base class for every raster processing operation.

    Examples:
        - MetadataProcessor
        - HillshadeProcessor
        - SlopeProcessor
        - AspectProcessor
        - SegFormerProcessor
    """

    @property
    @abstractmethod
    def name(self) -> ProcessorType:
        """
        The unique name/type of this processor.
        """
        pass

    @property
    def version(self) -> str:
        """
        Used for reproducibility and future analytics.
        """
        return "1.0.0"

    def supports(
        self,
        context: ProcessingContext,
    ) -> bool:
        """
        Determine whether this processor can execute
        with the provided context.

        Override if additional validation is required.
        """
        return True

    @abstractmethod
    def process(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        """
        Execute the processing operation.
        """
        raise NotImplementedError