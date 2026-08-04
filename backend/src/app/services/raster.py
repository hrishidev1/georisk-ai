from app.exceptions import (
    ProjectNotFoundError,
    RasterNotFoundError,
)
from app.models import (
    Raster,
    RasterSource,
    RasterStatus,
)
from app.repositories import (
    ProjectRepository,
    RasterRepository,
)
from app.schemas.raster import (
    RasterCreate,
    RasterUpdate,
)


class RasterService:
    def __init__(
        self,
        repository: RasterRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self._repository = repository
        self._project_repository = project_repository

    def _require_project(
        self,
        project_id: int,
    ):
        project = self._project_repository.get(
            project_id,
        )

        if project is None:
            raise ProjectNotFoundError()

        return project

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

    def create(
        self,
        project_id: int,
        file_path: str,
        raster: RasterCreate,
        parent_raster_id: int | None = None,
    ) -> Raster:
        self._require_project(project_id)

        raster_model = Raster(
            project_id=project_id,
            parent_raster_id=parent_raster_id,
            name=raster.name,
            description=raster.description,
            type=raster.type,
            source=RasterSource.UPLOADED,
            status=RasterStatus.UPLOADING,
            file_path=file_path,
        )

        return self._repository.create(
            raster_model,
        )

    def get(
        self,
        project_id: int,
        raster_id: int,
    ) -> Raster:
        return self._require_raster(
            project_id,
            raster_id,
        )

    def list(
        self,
        project_id: int,
    ) -> list[Raster]:
        self._require_project(project_id)

        return self._repository.list_by_project(
            project_id,
        )

    def update(
        self,
        project_id: int,
        raster_id: int,
        raster_update: RasterUpdate,
    ) -> Raster:
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
    ) -> None:
        raster = self._require_raster(
            project_id,
            raster_id,
        )

        self._repository.delete(
            raster,
        )