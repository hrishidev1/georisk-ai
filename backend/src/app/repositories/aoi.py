from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AOI
from app.repositories.base import BaseRepository


class AOIRepository(BaseRepository[AOI]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, AOI)

    def list_by_project(
        self,
        project_id: int,
    ) -> list[AOI]:
        result = self._db.execute(
            select(AOI)
            .where(AOI.project_id == project_id)
            .order_by(AOI.created_at.desc())
        )

        return result.scalars().all()

    def get_by_id_and_project(
        self,
        aoi_id: int,
        project_id: int,
    ) -> AOI | None:
        result = self._db.execute(
            select(AOI)
            .where(AOI.id == aoi_id)
            .where(AOI.project_id == project_id)
        )

        return result.scalar_one_or_none()

    def exists_in_project(
        self,
        aoi_id: int,
        project_id: int,
    ) -> bool:
        result = self._db.execute(
            select(AOI.id)
            .where(AOI.id == aoi_id)
            .where(AOI.project_id == project_id)
        )

        return result.scalar_one_or_none() is not None