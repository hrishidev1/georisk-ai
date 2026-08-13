from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

from fastapi import Form

from app.models import (
    RasterSource,
    RasterStatus,
    RasterType,
)

class RasterCreate(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
    )

    name: str

    description: str | None = None

    type: RasterType

    @classmethod
    def as_form(
        cls,
        name: Annotated[str, Form(...)],
        type: Annotated[RasterType, Form(...)],
        description: Annotated[str | None, Form()] = None,
    ) -> "RasterCreate":
        return cls(
            name=name,
            description=description,
            type=type,
        )


class RasterUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    description: str | None = None


class RasterResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    project_id: int
    parent_raster_id: int | None

    name: str
    description: str | None

    type: RasterType
    source: RasterSource
    status: RasterStatus

    file_path: str

    crs: str | None

    width: int | None
    height: int | None

    band_count: int | None

    pixel_size_x: float | None
    pixel_size_y: float |None

    min_x: float | None
    min_y: float | None
    max_x: float | None
    max_y: float | None

    file_size: int | None

    processor: str | None = None
    processor_version: str | None = None
    processing_parameters: dict | None = None

    created_at: datetime
    updated_at: datetime


class RasterBandStatistics(BaseModel):
    min: float
    max: float
    mean: float
    std: float
    valid_pixels: int
    histogram_counts: list[int]
    histogram_bins: list[float]


class RasterStatisticsResponse(BaseModel):
    bands: dict[str, RasterBandStatistics]