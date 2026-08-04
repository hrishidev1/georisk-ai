from app.exceptions.project import ProjectNotFoundError
from app.models import Project, User
from app.repositories import ProjectRepository
from app.schemas import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(
        self,
        repository: ProjectRepository,
    ) -> None:
        self._repository = repository

    def _require_project(
        self,
        project_id: int,
        owner: User,
    ) -> Project:
        project = self._repository.get_by_id_and_owner(
            project_id,
            owner.id,
        )

        if project is None:
            raise ProjectNotFoundError()

        return project

    def create_project(
        self,
        data: ProjectCreate,
        owner: User,
    ) -> Project:
        project = Project(
            name=data.name,
            description=data.description,
            owner_id=owner.id,
        )

        return self._repository.create(project)

    def list_projects(
        self,
        owner: User,
    ) -> list[Project]:
        return self._repository.list_by_owner(owner.id)

    def get_project(
        self,
        project_id: int,
        owner: User,
    ) -> Project:
        return self._require_project(
            project_id,
            owner,
        )

    def update_project(
        self,
        project_id: int,
        data: ProjectUpdate,
        owner: User,
    ) -> Project:
        project = self._require_project(
            project_id,
            owner,
        )

        updates = data.model_dump(exclude_unset=True)

        for field, value in updates.items():
            setattr(project, field, value)

        return self._repository.update(project)

    def delete_project(
        self,
        project_id: int,
        owner: User,
    ) -> None:
        project = self._require_project(
            project_id,
            owner,
        )

        self._repository.delete(project)