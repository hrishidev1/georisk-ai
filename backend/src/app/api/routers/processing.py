from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)

from app.api.dependencies import (
    get_current_user,
    get_processing_service,
)
from app.models import User
from app.schemas.processing import (
    ProcessingJobResponse,
    ProcessingRequest,
)
from app.services.processing import ProcessingService

router = APIRouter(
    prefix="/processing",
    tags=["Processing"],
)


@router.post(
    "/jobs",
    response_model=ProcessingJobResponse,
    status_code=status.HTTP_202_ACCEPTED
)
def create_processing_job(
    request: ProcessingRequest,
    service: ProcessingService = Depends(
        get_processing_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    return service.process(
        raster_id=request.raster_id,
        processor=request.processor,
        parameters=request.parameters,
        current_user=current_user,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=ProcessingJobResponse,
)
def get_processing_job(
    job_id: int,
    service: ProcessingService = Depends(
        get_processing_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Retrieve a processing job.
    """

    return service.get_job(
        job_id,
        current_user,
    )


@router.get(
    "/jobs",
    response_model=list[ProcessingJobResponse],
)
def list_processing_jobs(
    project_id: int | None = None,
    raster_id: int | None = None,
    status: str | None = None,
    service: ProcessingService = Depends(
        get_processing_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    List processing jobs with optional filtering.
    """
    
    # We map status string to enum if provided
    from app.processing.enums import ProcessingStatus
    job_status = ProcessingStatus(status) if status else None

    return service.list_jobs(
        project_id=project_id,
        raster_id=raster_id,
        status=job_status,
    )

@router.delete(
    "/jobs/{job_id}",
    response_model=ProcessingJobResponse,
)
def cancel_processing_job(
    job_id: int,
    service: ProcessingService = Depends(
        get_processing_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    """
    Cancel a processing job.
    """

    return service.cancel_job(
        job_id,
        current_user,
    )