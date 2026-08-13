from app.processing.executors.local import LocalExecutor
from app.processing.manager import ProcessingManager
from app.processing.processors.aspect import AspectProcessor
from app.processing.processors.hillshade import HillshadeProcessor
from app.processing.processors.metadata import MetadataProcessor
from app.processing.processors.slope import SlopeProcessor
from app.processing.registry import ProcessorRegistry
from app.processing.processors.color_relief import ColorReliefProcessor
from app.processing.processors.contour import ContourProcessor
from app.processing.processors.clip import ClipProcessor
from app.processing.processors.merge import MergeProcessor
from app.processing.processors.reproject import ReprojectProcessor


def create_processing_manager() -> ProcessingManager:
    """
    Create the application's processing manager.
    """

    registry = ProcessorRegistry()

    registry.register(
        MetadataProcessor(),
    )

    registry.register(
        HillshadeProcessor(),
    )

    registry.register(
        SlopeProcessor(),
    )

    registry.register(
        AspectProcessor(),
    )

    executor = LocalExecutor()

    registry.register(
        ColorReliefProcessor()
    )

    registry.register(
        ContourProcessor()
    )

    registry.register(
        ClipProcessor()
    )

    registry.register(
        MergeProcessor()
    )

    registry.register(
        ReprojectProcessor()
    )

    return ProcessingManager(
        registry=registry,
        executor=executor,
    )