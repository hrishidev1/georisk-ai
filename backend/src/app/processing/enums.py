from enum import StrEnum


class ProcessingStatus(StrEnum):
    """
    Current execution state of a processing job.
    """

    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    CANCELLING = "cancelling"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ProcessorType(StrEnum):
    """
    Supported processing operations.
    """

    METADATA = "metadata"

    HILLSHADE = "hillshade"
    SLOPE = "slope"
    ASPECT = "aspect"
    COLOR_RELIEF = "color_relief"

    CLIP = "clip"
    MERGE = "merge"
    REPROJECT = "reproject"

    PREDICTION = "prediction"
    UNCERTAINTY = "uncertainty"

    CUSTOM = "custom"


class ExecutorType(StrEnum):
    """
    Processing execution backend.
    """

    LOCAL = "local"

    SPARK = "spark"
    PUBSUB = "pubsub"
    CELERY = "celery"