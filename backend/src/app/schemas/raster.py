from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import (
    RasterSource,
    RasterStatus,
    RasterType,
)


class RasterCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )
    description: str | None = None
    type: RasterType


class RasterUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    description: str | None = None


class RasterMetadata(BaseModel):
    crs: str | None

    width: int | None
    height: int | None

    band_count: int | None

    pixel_size_x: float | None
    pixel_size_y: float | None

    min_x: float | None
    min_y: float | None
    max_x: float | None
    max_y: float | None

    file_size: int | None


class RasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    project_id: int
    parent_raster_id: int | None

    name: str
    description: str | None

    type: RasterType
    source: RasterSource
    status: RasterStatus

    metadata: RasterMetadata

    created_at: datetime
    updated_at: datetime