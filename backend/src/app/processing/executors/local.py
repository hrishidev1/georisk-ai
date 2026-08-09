from __future__ import annotations

from app.processing.base import Processor
from app.processing.context import ProcessingContext
from app.processing.exceptions import (
    ProcessorExecutionError,
    UnsupportedProcessorError,
    ProcessingCancelledError,
)
from app.processing.executors.base import ProcessingExecutor
from app.processing.result import ProcessingResult


class LocalExecutor(ProcessingExecutor):
    """
    Executes processors within the current Python process.
    """

    @property
    def name(self) -> str:
        return "local"

    def execute(
        self,
        processor: Processor,
        context: ProcessingContext,
    ) -> ProcessingResult:
        """
        Execute a processor synchronously.
        """

        if not processor.supports(context):
            raise UnsupportedProcessorError(
                f"Processor '{processor.name}' does not support "
                f"the supplied processing context."
            )

        try:
            result = processor.process(
                context,
            )

            if not isinstance(
                result,
                ProcessingResult,
            ):
                raise TypeError(
                    f"{processor.__class__.__name__} "
                    "returned an invalid ProcessingResult."
                )

            return result
        except ProcessorExecutionError:
            raise
        except ProcessingCancelledError as exc:
            from app.processing.enums import ProcessingStatus
            return ProcessingResult(
                status=ProcessingStatus.CANCELLED,
                logs=[str(exc)],
            )
        except Exception as exc:
            raise ProcessorExecutionError(
                f"Processor '{processor.name}' failed."
            ) from exc