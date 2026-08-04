from app.exceptions import AOINotFoundError
from app.geo import (
    feature_to_geometry,
    geometry_to_feature,
    validate_feature,
)
from app.models import AOI
from app.models.user import User
from app.repositories import AOIRepository
from app.schemas import (
    AOICreate,
    AOIResponse,
    AOIUpdate,
)
from app.services.project_access import ProjectAccessService


class AOIService:
    def __init__(
        self,
        repository: AOIRepository,
        project_access: ProjectAccessService,
    ) -> None:
        self._repository = repository
        self._project_access = project_access

    def _require_aoi(
        self,
        aoi_id: int,
        project_id: int,
    ) -> AOI:
        aoi = self._repository.get_by_id_and_project(
            aoi_id,
            project_id,
        )

        if aoi is None:
            raise AOINotFoundError()

        return aoi

    def _build_response(
        self,
        aoi: AOI,
    ) -> AOIResponse:
        return AOIResponse(
            id=aoi.id,
            name=aoi.name,
            description=aoi.description,
            project_id=aoi.project_id,
            created_at=aoi.created_at,
            updated_at=aoi.updated_at,
            feature=geometry_to_feature(aoi.geometry),
        )

    def create_aoi(
        self,
        project_id: int,
        data: AOICreate,
        current_user: User,
    ) -> AOIResponse:

        self._project_access.get_owned_project(
            project_id,
            current_user.id,
        )

        validate_feature(data.feature)

        geometry = feature_to_geometry(
            data.feature,
        )

        aoi = self._repository.create(
            AOI(
                name=data.name,
                description=data.description,
                geometry=geometry,
                project_id=project_id,
            )
        )

        return self._build_response(aoi)

    def list_aois(
        self,
        project_id: int,
        current_user: User,
    ) -> list[AOIResponse]:

        self._project_access.get_owned_project(
            project_id,
            current_user.id,
        )

        aois = self._repository.list_by_project(
            project_id,
        )

        return [
            self._build_response(aoi)
            for aoi in aois
        ]

    def get_aoi(
        self,
        project_id: int,
        aoi_id: int,
        current_user: User,
    ) -> AOIResponse:

        self._project_access.get_owned_project(
            project_id,
            current_user.id,
        )

        aoi = self._require_aoi(
            aoi_id,
            project_id,
        )

        return self._build_response(aoi)

    def update_aoi(
        self,
        project_id: int,
        aoi_id: int,
        data: AOIUpdate,
        current_user: User,
    ) -> AOIResponse:

        self._project_access.get_owned_project(
            project_id,
            current_user.id,
        )

        aoi = self._require_aoi(
            aoi_id,
            project_id,
        )

        if data.name is not None:
            aoi.name = data.name

        if data.description is not None:
            aoi.description = data.description

        if data.feature is not None:
            validate_feature(data.feature)
            aoi.geometry = feature_to_geometry(
                data.feature,
            )

        aoi = self._repository.update(
            aoi,
        )

        return self._build_response(aoi)

    def delete_aoi(
        self,
        project_id: int,
        aoi_id: int,
        current_user: User,
    ) -> None:

        self._project_access.get_owned_project(
            project_id,
            current_user.id,
        )

        aoi = self._require_aoi(
            aoi_id,
            project_id,
        )

        self._repository.delete(
            aoi,
        )