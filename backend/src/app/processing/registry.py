from __future__ import annotations

from app.processing.base import Processor
from app.processing.enums import ProcessorType
from app.processing.exceptions import ProcessorNotFoundError


class ProcessorRegistry:
    """
    Registry for all available processing plugins.

    Acts as the central lookup point for processors.
    """

    def __init__(self) -> None:
        self._processors: dict[
            ProcessorType,
            Processor,
        ] = {}

    def register(
        self,
        processor: Processor,
    ) -> None:
        """
        Register a processor.

        Raises:
            ValueError:
                If a processor with the same name
                is already registered.
        """
        if processor.name in self._processors:
            raise ValueError(
                f"Processor '{processor.name}' is already registered."
            )

        self._processors[
            processor.name
        ] = processor

    def unregister(
        self,
        processor_type: ProcessorType,
    ) -> None:
        """
        Remove a processor from the registry.
        """
        self._processors.pop(
            processor_type,
            None,
        )

    def get(
        self,
        processor_type: ProcessorType,
    ) -> Processor:
        """
        Retrieve a registered processor.

        Raises:
            ProcessorNotFoundError:
                If the processor has not been registered.
        """
        processor = self._processors.get(
            processor_type,
        )

        if processor is None:
            raise ProcessorNotFoundError(
                f"Processor '{processor_type}' is not registered."
            )

        return processor

    def has(
        self,
        processor_type: ProcessorType,
    ) -> bool:
        """
        Check whether a processor is registered.
        """
        return processor_type in self._processors

    def list(
        self,
    ) -> list[Processor]:
        """
        Return all registered processors.
        """
        return list(
            self._processors.values(),
        )

    def clear(
        self,
    ) -> None:
        """
        Remove every registered processor.
        """
        self._processors.clear()

    def __contains__(
        self,
        processor_type: ProcessorType,
    ) -> bool:
        return self.has(
            processor_type,
        )

    def __len__(
        self,
    ) -> int:
        return len(
            self._processors,
        )

    def __iter__(
        self,
    ):
        return iter(
            self._processors.values(),
        )
        