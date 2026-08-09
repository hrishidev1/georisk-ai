from __future__ import annotations

from app.processing.context import ProcessingContext
from app.processing.enums import ProcessingStatus
from app.processing.exceptions import (
    InvalidProcessingContextError,
)
from app.processing.executors.base import ProcessingExecutor
from app.processing.registry import ProcessorRegistry
from app.processing.result import ProcessingResult


class ProcessingManager:
    """
    Orchestrates raster processing.

    Responsibilities:
    - Validate processing context
    - Resolve processor
    - Delegate execution
    - Return standardized result

    The manager never knows *how* processing is
    performed, only *which* processor should run.
    """

    def __init__(
        self,
        registry: ProcessorRegistry,
        executor: ProcessingExecutor,
    ) -> None:
        self._registry = registry
        self._executor = executor

    def execute(
        self,
        context: ProcessingContext,
    ) -> ProcessingResult:
        """
        Execute a processing operation.
        """

        self._validate_context(
            context,
        )

        processor = self._registry.get(
            context.processor,
        )

        result = self._executor.execute(
            processor=processor,
            context=context,
        )

        return result

    @staticmethod
    def _validate_context(
        context: ProcessingContext,
    ) -> None:
        """
        Validate the supplied processing context.
        """

        if context.raster is None:
            raise InvalidProcessingContextError(
                "Processing context is missing raster."
            )

        if not context.input_path.exists():
            raise InvalidProcessingContextError(
                f"Input raster '{context.input_path}' does not exist."
            )

        if context.storage is None:
            raise InvalidProcessingContextError(
                "Processing context is missing storage service."
            )

        context.working_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        context.output_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

    @property
    def executor_name(
        self,
    ) -> str:
        return self._executor.name

    @property
    def registered_processors(
        self,
    ) -> list[str]:
        return [
            processor.name.value
            for processor in self._registry
        ]