from __future__ import annotations

from abc import ABC, abstractmethod

from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.result import ProcessingResult


class ProcessingExecutor(ABC):
    """
    Base class for all processing executors.

    An executor determines *where* and *how* a processor
    executes, while the processor itself defines *what*
    operation is performed.

    Examples:
        - LocalExecutor
        - SparkExecutor
        - PubSubExecutor
        - CeleryExecutor
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """
        Unique executor name.
        """
        raise NotImplementedError

    @abstractmethod
    def execute(
        self,
        processor: Processor,
        context: ProcessingContext,
    ) -> ProcessingResult:
        """
        Execute the supplied processor.

        Parameters
        ----------
        processor:
            Processing plugin to execute.

        context:
            Immutable processing context.

        Returns
        -------
        ProcessingResult
            Result produced by the processor.
        """
        raise NotImplementedError