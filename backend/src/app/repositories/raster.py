from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Raster, RasterStatus, RasterType
from app.repositories.base import BaseRepository


class RasterRepository(BaseRepository[Raster]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Raster)

    def get_by_project(
        self,
        project_id: int,
    ) -> list[Raster]:
        result = self._db.execute(
            select(Raster)
            .where(Raster.project_id == project_id)
            .order_by(Raster.created_at.desc())
        )

        return result.scalars().all()

    def get_children(
        self,
        parent_raster_id: int,
    ) -> list[Raster]:
        result = self._db.execute(
            select(Raster)
            .where(Raster.parent_raster_id == parent_raster_id)
            .order_by(Raster.created_at.asc())
        )

        return result.scalars().all()

    def get_by_type(
        self,
        project_id: int,
        raster_type: RasterType,
    ) -> list[Raster]:
        result = self._db.execute(
            select(Raster)
            .where(Raster.project_id == project_id)
            .where(Raster.type == raster_type)
            .order_by(Raster.created_at.desc())
        )

        return result.scalars().all()

    def get_by_status(
        self,
        project_id: int,
        status: RasterStatus,
    ) -> list[Raster]:
        result = self._db.execute(
            select(Raster)
            .where(Raster.project_id == project_id)
            .where(Raster.status == status)
            .order_by(Raster.created_at.desc())
        )

        return result.scalars().all()

    def get_by_id_and_project(
        self,
        raster_id: int,
        project_id: int,
    ) -> Raster | None:
        result = self._db.execute(
            select(Raster)
            .where(Raster.id == raster_id)
            .where(Raster.project_id == project_id)
        )

        return result.scalar_one_or_none()

    def create(
        self,
        raster: Raster,
    ) -> Raster:
        self._db.add(
            raster,
        )

        self._db.commit()

        self._db.refresh(
            raster,
        )

        return raster