from pathlib import Path
from typing import BinaryIO
from uuid import uuid4

from app.exceptions import RasterNotFoundError
from app.models import (
    Raster,
    RasterSource,
    RasterStatus,
    User,
)
from app.raster import (
    extract_metadata,
    validate_raster,
)
from app.raster.models import RasterMetadata
from app.repositories import RasterRepository
from app.schemas.raster import (
    RasterCreate,
    RasterUpdate,
)
from app.services.project_access import ProjectAccessService
from app.storage.base import StorageService
from app.storage.paths import StoragePaths


class RasterService:
    def __init__(
        self,
        repository: RasterRepository,
        project_access_service: ProjectAccessService,
        storage_service: StorageService,
    ) -> None:
        self._repository = repository
        self._project_access_service = project_access_service
        self._storage_service = storage_service

    def _require_raster(
        self,
        project_id: int,
        raster_id: int,
    ) -> Raster:
        raster = self._repository.get_by_id_and_project(
            raster_id=raster_id,
            project_id=project_id,
        )

        if raster is None:
            raise RasterNotFoundError()

        return raster

    def _build_storage_path(
        self,
        project_id: int,
        filename: str,
    ) -> Path:
        extension = Path(filename).suffix.lower()

        return StoragePaths.raster_upload(
            project_id=project_id,
            raster_id=uuid4(),
            extension=extension,
        )

    def _create_raster_model(
        self,
        *,
        project_id: int,
        destination: Path,
        metadata: RasterMetadata,
        raster: RasterCreate,
        parent_raster_id: int | None,
    ) -> Raster:
        return Raster(
            project_id=project_id,
            parent_raster_id=parent_raster_id,
            name=raster.name,
            description=raster.description,
            type=raster.type,
            source=RasterSource.UPLOADED,
            status=RasterStatus.READY,
            file_path=str(destination),
            crs=metadata.crs,
            width=metadata.width,
            height=metadata.height,
            band_count=metadata.band_count,
            pixel_size_x=metadata.pixel_size_x,
            pixel_size_y=metadata.pixel_size_y,
            min_x=metadata.min_x,
            min_y=metadata.min_y,
            max_x=metadata.max_x,
            max_y=metadata.max_y,
            file_size=metadata.file_size,
        )

    def create_uploaded_raster(
        self,
        project_id: int,
        file: BinaryIO,
        filename: str,
        raster: RasterCreate,
        current_user: User,
        parent_raster_id: int | None = None,
    ) -> Raster:
        """
        Upload, validate, extract metadata, and register a raster.
        """

        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        destination = self._build_storage_path(
            project_id=project_id,
            filename=filename,
        )

        stored_path = self._storage_service.save(
            file=file,
            destination=destination,
        )

        try:
            validate_raster(
                stored_path,
            )

            metadata = extract_metadata(
                stored_path,
            )

            raster_model = self._create_raster_model(
                project_id=project_id,
                destination=destination,
                metadata=metadata,
                raster=raster,
                parent_raster_id=parent_raster_id,
            )

            return self._repository.create(
                raster_model,
            )

        except Exception:
            self._storage_service.delete(
                destination,
            )
            raise

    def list(
        self,
        project_id: int,
        current_user: User,
    ) -> list[Raster]:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        return self._repository.get_by_project(
            project_id,
        )

    def get(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> Raster:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        return self._require_raster(
            project_id,
            raster_id,
        )

    def update(
        self,
        project_id: int,
        raster_id: int,
        raster_update: RasterUpdate,
        current_user: User,
    ) -> Raster:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        raster = self._require_raster(
            project_id,
            raster_id,
        )

        updates = raster_update.model_dump(
            exclude_unset=True,
        )

        for field, value in updates.items():
            setattr(
                raster,
                field,
                value,
            )

        return self._repository.update(
            raster,
        )

    def delete(
        self,
        project_id: int,
        raster_id: int,
        current_user: User,
    ) -> None:
        self._project_access_service.get_owned_project(
            project_id,
            current_user.id,
        )

        raster = self._require_raster(
            project_id,
            raster_id,
        )

        self._storage_service.delete(
            Path(raster.file_path),
        )

        self._repository.delete(
            raster,
        )