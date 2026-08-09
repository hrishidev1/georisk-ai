from pathlib import Path
from uuid import UUID, uuid4
from app.processing.enums import ProcessorType



class StoragePaths:
    """
    Helpers for constructing logical storage paths.

    All paths returned are relative to the configured storage root.
    """

    @staticmethod
    def project(
        project_id: int,
    ) -> Path:
        return (
            Path("projects")
            / str(project_id)
        )

    @staticmethod
    def raster_directory(
        project_id: int,
    ) -> Path:
        return (
            StoragePaths.project(project_id)
            / "rasters"
        )

    @staticmethod
    def raster_upload(
        project_id: int,
        raster_id: UUID,
        extension: str,
    ) -> Path:
        """
        Path for an uploaded raster.
        """

        return (
            StoragePaths.raster_directory(project_id)
            / f"{raster_id}{extension.lower()}"
        )

    @staticmethod
    def preview(
        project_id: int,
        raster_id: UUID,
    ) -> Path:
        """
        Path for a generated preview image.
        """

        return (
            StoragePaths.raster_directory(project_id)
            / "previews"
            / f"{raster_id}.png"
        )

    @staticmethod
    def thumbnail(
        project_id: int,
        raster_id: UUID,
    ) -> Path:
        """
        Path for a generated thumbnail.
        """

        return (
            StoragePaths.raster_directory(project_id)
            / "thumbnails"
            / f"{raster_id}.png"
        )

    @staticmethod
    def generated_raster(
        project_id: int,
        processor: ProcessorType,
        extension: str = ".tif",
    ) -> Path:
        """
        Path for generated rasters
        (hillshade, slope, predictions, etc.).
        """
        return (
            Path("projects")
            / str(project_id)
            / "generated"
            / processor.value
            / f"{uuid4()}{extension}"
        )

    @staticmethod
    def temporary(
        filename: str,
    ) -> Path:
        """
        Temporary storage path.
        """
        return (
            Path("tmp")
            / filename
        )

    @staticmethod
    def temp(
        project_id: int,
    ) -> Path:
        """
        Temporary working directory for a project's processing jobs.
        """
        return (
            Path("tmp")
            / str(project_id)
        )

    @staticmethod
    def outputs(
        project_id: int,
    ) -> Path:
        """
        Output directory for generated rasters.
        """
        return (
            StoragePaths.project(project_id)
            / "generated"
        )