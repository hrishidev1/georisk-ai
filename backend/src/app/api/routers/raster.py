from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
    Form,
    HTTPException,
)

from fastapi import UploadFile, File
from app.api.dependencies import (
    get_current_user,
    get_raster_service,
)
from app.models import User
from app.schemas import (
    RasterResponse,
    RasterUpdate,
)
from app.services import RasterService
from typing import Annotated
from app.schemas.raster import RasterCreate

router = APIRouter(
    prefix="/projects/{project_id}/rasters",
    tags=["Rasters"],
)

@router.get(
    "",
    response_model=list[RasterResponse],
)
def list_rasters(
    project_id: int,
    service: RasterService = Depends(
        get_raster_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    return service.list(
        project_id,
        current_user,
    )

@router.post(
    "/upload",
    response_model=RasterResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_raster(
    project_id: int,
    file: UploadFile = File(...),
    raster: Annotated[
        RasterCreate,
        Depends(RasterCreate.as_form),
    ] = None,
    service: RasterService = Depends(
        get_raster_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    if file.filename is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )
    return service.create_uploaded_raster(
        project_id=project_id,
        file=file.file,
        filename=file.filename,
        raster=raster,
        current_user=current_user,
    )

@router.get(
    "/{raster_id}",
    response_model=RasterResponse,
)
def get_raster(
    project_id: int,
    raster_id: int,
    service: RasterService = Depends(
        get_raster_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    return service.get(
        project_id,
        raster_id,
        current_user,
    )

@router.patch(
    "/{raster_id}",
    response_model=RasterResponse,
)
def update_raster(
    project_id: int,
    raster_id: int,
    data: RasterUpdate,
    service: RasterService = Depends(
        get_raster_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    return service.update(
        project_id,
        raster_id,
        data,
        current_user,
    )

@router.delete(
    "/{raster_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_raster(
    project_id: int,
    raster_id: int,
    service: RasterService = Depends(
        get_raster_service,
    ),
    current_user: User = Depends(
        get_current_user,
    ),
):
    service.delete(
        project_id,
        raster_id,
        current_user,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )

