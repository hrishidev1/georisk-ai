from app.exceptions import ProjectNotFoundError
from app.models import Project
from app.repositories import ProjectRepository


class ProjectAccessService:
    """
    Provides authorization and ownership checks for project-scoped resources.
    """

    def __init__(
        self,
        repository: ProjectRepository,
    ) -> None:
        self._repository = repository

    def get_owned_project(
        self,
        project_id: int,
        owner_id: int,
    ) -> Project:
        project = self._repository.get_by_id_and_owner(
            project_id,
            owner_id,
        )

        if project is None:
            raise ProjectNotFoundError()

        return project