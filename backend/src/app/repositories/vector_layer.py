from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import VectorLayer
from app.repositories.base import BaseRepository


class VectorLayerRepository(BaseRepository[VectorLayer]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, VectorLayer)

    def get_by_id(
        self,
        vector_layer_id: int,
    ) -> VectorLayer | None:
        result = self._db.execute(
            select(VectorLayer)
            .where(VectorLayer.id == vector_layer_id)
        )
        return result.scalar_one_or_none()

    def get_by_project(
        self,
        project_id: int,
    ) -> list[VectorLayer]:
        result = self._db.execute(
            select(VectorLayer)
            .where(VectorLayer.project_id == project_id)
            .order_by(VectorLayer.created_at.desc())
        )

        return result.scalars().all()

    def get_by_parent_raster(
        self,
        parent_raster_id: int,
    ) -> list[VectorLayer]:
        result = self._db.execute(
            select(VectorLayer)
            .where(VectorLayer.parent_raster_id == parent_raster_id)
            .order_by(VectorLayer.created_at.asc())
        )

        return result.scalars().all()

    def create(
        self,
        vector_layer: VectorLayer,
    ) -> VectorLayer:
        self._db.add(
            vector_layer,
        )

        self._db.commit()

        self._db.refresh(
            vector_layer,
        )

        return vector_layer

    def delete(
        self,
        vector_layer: VectorLayer,
    ) -> None:
        self._db.delete(
            vector_layer,
        )
        self._db.commit()
