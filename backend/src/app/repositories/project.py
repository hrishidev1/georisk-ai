from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, db: Session):
        super().__init__(db, Project)

    def list_by_owner(
        self,
        owner_id: int,
    ) -> list[Project]:
        """
        Retrieve all projects owned by a specific user.
        """

        statement = (
            select(Project)
            .where(Project.owner_id == owner_id)
            .order_by(Project.created_at.desc())
        )

        return list(self.db.scalars(statement).all())

    def get_by_id_and_owner(
        self,
        project_id: int,
        owner_id: int,
    ) -> Project | None:
        """
        Retrieve a project only if it belongs to the given owner.
        """

        statement = (
            select(Project)
            .where(Project.id == project_id)
            .where(Project.owner_id == owner_id)
        )

        return self.db.scalar(statement)