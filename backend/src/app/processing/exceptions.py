class ProcessingError(Exception):
    """
    Base exception for all processing-related errors.
    """

    pass


class ProcessorNotFoundError(ProcessingError):
    """
    Raised when a requested processor is not registered.
    """

    pass


class ProcessorExecutionError(ProcessingError):
    """
    Raised when a processor fails during execution.
    """

    pass


class UnsupportedProcessorError(ProcessingError):
    """
    Raised when a processor cannot handle
    the supplied processing context.
    """

    pass


class InvalidProcessingContextError(ProcessingError):
    """
    Raised when the supplied ProcessingContext
    is invalid or incomplete.
    """

    pass


class ExecutorError(ProcessingError):
    """
    Base exception for executor-related errors.
    """

    pass


class ExecutorNotAvailableError(ExecutorError):
    """
    Raised when the requested executor
    cannot be used.
    """

    pass

class ProcessingCancelledError(Exception):
    """
    Raised when a processing job has been cancelled.
    """

    def __init__(
        self,
        message: str = "Processing job cancelled.",
    ) -> None:
        super().__init__(message)