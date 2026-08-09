from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response, JSONResponse
from rio_tiler.io import Reader
from rio_tiler.profiles import img_profiles

from app.api.dependencies import get_current_user, get_raster_service, get_storage_service
from app.models import User
from app.services import RasterService
from app.storage.base import StorageService
from pathlib import Path

router = APIRouter(
    prefix="/projects/{project_id}/rasters/{raster_id}",
    tags=["Tiles"],
)

def get_raster_path(
    project_id: int, 
    raster_id: int, 
    service: RasterService, 
    current_user: User,
    storage: StorageService
) -> str:
    """Helper to get the local file path for a raster, ensuring authorization."""
    raster = service.get(project_id, raster_id, current_user)
    if not raster:
        raise HTTPException(status_code=404, detail="Raster not found")
    
    try:
        full_path = storage.resolve_path(Path(raster.file_path))
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="Raster file not found on disk")
        return str(full_path)
    except Exception:
        raise HTTPException(status_code=404, detail="Raster file not found on disk")


@router.get(
    "/tiles/{z}/{x}/{y}.png",
    responses={
        200: {
            "content": {"image/png": {}},
            "description": "Return a map tile as a PNG image.",
        }
    },
)
def get_tile(
    project_id: int,
    raster_id: int,
    z: int,
    x: int,
    y: int,
    service: RasterService = Depends(get_raster_service),
    current_user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
):
    """
    Generate a map tile from a GeoTIFF using rio-tiler.
    """
    raster_path = get_raster_path(project_id, raster_id, service, current_user, storage)

    try:
        with Reader(raster_path) as src:
            # Read the tile data
            img = src.tile(x, y, z)
            
            # Render to PNG
            content = img.render(img_format="PNG")
            
            return Response(content, media_type="image/png")
    except Exception as e:
        from rio_tiler.errors import TileOutsideBounds
        if isinstance(e, TileOutsideBounds):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tile outside bounds",
            )
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating tile: {str(e)}",
        )


@router.get(
    "/tilejson.json",
    response_model=dict,
)
def get_tilejson(
    project_id: int,
    raster_id: int,
    # Need request to build the full tile URL
    service: RasterService = Depends(get_raster_service),
    current_user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
):
    """
    Return TileJSON metadata for the map client.
    """
    raster_path = get_raster_path(project_id, raster_id, service, current_user, storage)

    try:
        with Reader(raster_path) as src:
            bounds = src.geographic_bounds
            minzoom = src.minzoom
            maxzoom = src.maxzoom

            # In a real app we'd construct this dynamically from the request object, 
            # but for our Next.js frontend proxy setup, a relative path is safer.
            tile_url = f"/api/v1/projects/{project_id}/rasters/{raster_id}/tiles/{{z}}/{{x}}/{{y}}.png"

            tilejson = {
                "tilejson": "2.2.0",
                "version": "1.0.0",
                "scheme": "xyz",
                "tiles": [tile_url],
                "minzoom": minzoom,
                "maxzoom": maxzoom,
                "bounds": list(bounds),
            }
            
            return JSONResponse(tilejson)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading raster metadata: {str(e)}",
        )
