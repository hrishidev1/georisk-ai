from sqlalchemy.orm import Session

from app.models import ProcessingJob
from app.processing.enums import ProcessingStatus
from app.repositories.base import BaseRepository


class ProcessingJobRepository(
    BaseRepository[ProcessingJob],
):
    """
    Repository for processing job persistence.
    """

    def __init__(self, db: Session) -> None:
        super().__init__(db, ProcessingJob)

    def create(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        self._db.add(job)
        self._db.commit()
        self._db.refresh(job)

        return job

    def get_by_id(
        self,
        job_id: int,
    ) -> ProcessingJob | None:
        return (
            self._db.query(
                ProcessingJob,
            )
            .filter(
                ProcessingJob.id == job_id,
            )
            .first()
        )

    def get_latest_for_raster(
        self,
        raster_id: int,
    ) -> ProcessingJob | None:
        return (
            self._db.query(
                ProcessingJob,
            )
            .filter(
                ProcessingJob.raster_id == raster_id,
            )
            .order_by(
                ProcessingJob.created_at.desc(),
            )
            .first()
        )

    def get_by_raster(
        self,
        raster_id: int,
    ) -> list[ProcessingJob]:
        return (
            self._db.query(
                ProcessingJob,
            )
            .filter(
                ProcessingJob.raster_id == raster_id,
            )
            .order_by(
                ProcessingJob.created_at.desc(),
            )
            .all()
        )

    def get_by_status(
        self,
        status: ProcessingStatus,
    ) -> list[ProcessingJob]:
        return (
            self._db.query(
                ProcessingJob,
            )
            .filter(
                ProcessingJob.status == status,
            )
            .order_by(
                ProcessingJob.created_at.asc(),
            )
            .all()
        )

    def update(
        self,
        job: ProcessingJob,
    ) -> ProcessingJob:
        self._db.commit()
        self._db.refresh(job)

        return job

    def delete(
        self,
        job: ProcessingJob,
    ) -> None:
        self._db.delete(job)
        self._db.commit()


    def list(
        self,
        *,
        project_id: int | None = None,
        raster_id: int | None = None,
        status: ProcessingStatus | None = None,
    ) -> list[ProcessingJob]:
        query = self._db.query(
            ProcessingJob,
        )

        if project_id is not None:
            from app.models import Raster
            query = query.join(
                ProcessingJob.raster,
            ).filter(
                Raster.project_id == project_id,
            )

        if raster_id is not None:
            query = query.filter(
                ProcessingJob.raster_id == raster_id,
            )

        if status is not None:
            query = query.filter(
                ProcessingJob.status == status,
            )

        return (
            query.order_by(
                ProcessingJob.created_at.desc(),
            )
            .limit(100)
            .all()
        )