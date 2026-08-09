from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)

from app.api.dependencies import (
    get_aoi_service,
    get_current_user,
)
from app.models import User
from app.schemas import (
    AOICreate,
    AOIResponse,
    AOIUpdate,
)
from app.services import AOIService


router = APIRouter(
    prefix="/projects/{project_id}/aois",
    tags=["AOIs"],
)


@router.post(
    "",
    response_model=AOIResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_aoi(
    project_id: int,
    data: AOICreate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: AOIService = Depends(
        get_aoi_service,
    ),
) -> AOIResponse:
    return service.create_aoi(
        project_id,
        data,
        current_user,
    )


@router.get(
    "",
    response_model=list[AOIResponse],
)
def list_aois(
    project_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: AOIService = Depends(
        get_aoi_service,
    ),
) -> list[AOIResponse]:
    return service.list_aois(
        project_id,
        current_user,
    )


@router.get(
    "/{aoi_id}",
    response_model=AOIResponse,
)
def get_aoi(
    project_id: int,
    aoi_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: AOIService = Depends(
        get_aoi_service,
    ),
) -> AOIResponse:
    return service.get_aoi(
        project_id,
        aoi_id,
        current_user,
    )


@router.patch(
    "/{aoi_id}",
    response_model=AOIResponse,
)
def update_aoi(
    project_id: int,
    aoi_id: int,
    data: AOIUpdate,
    current_user: User = Depends(
        get_current_user,
    ),
    service: AOIService = Depends(
        get_aoi_service,
    ),
) -> AOIResponse:
    return service.update_aoi(
        project_id,
        aoi_id,
        data,
        current_user,
    )


@router.delete(
    "/{aoi_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_aoi(
    project_id: int,
    aoi_id: int,
    current_user: User = Depends(
        get_current_user,
    ),
    service: AOIService = Depends(
        get_aoi_service,
    ),
) -> Response:
    service.delete_aoi(
        project_id,
        aoi_id,
        current_user,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )