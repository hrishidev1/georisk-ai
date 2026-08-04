from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(
        self,
        db: Session,
        model: type[ModelType],
    ) -> None:
        self._db = db
        self._model = model

    def get(
        self,
        obj_id: int,
    ) -> ModelType | None:
        return self._db.get(self._model, obj_id)

    def get_all(self) -> list[ModelType]:
        return self._db.scalars(
            select(self._model),
        ).all()

    def create(
        self,
        obj: ModelType,
    ) -> ModelType:
        self._db.add(obj)
        self._db.commit()
        self._db.refresh(obj)
        return obj

    def update(
        self,
        obj: ModelType,
    ) -> ModelType:
        self._db.add(obj)
        self._db.commit()
        self._db.refresh(obj)
        return obj

    def delete(
        self,
        obj: ModelType,
    ) -> None:
        self._db.delete(obj)
        self._db.commit()