from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True, frozen=True)
class RasterMetadata:
    """
    Internal representation of raster metadata.

    This model is used throughout the raster processing layer and
    should not be exposed directly through the REST API.
    """

    path: Path

    driver: str

    crs: str | None

    width: int
    height: int

    band_count: int

    dtype: str

    nodata: float | int | None

    pixel_size_x: float
    pixel_size_y: float

    min_x: float
    min_y: float
    max_x: float
    max_y: float

    file_size: int


@dataclass(slots=True, frozen=True)
class RasterValidationResult:
    """
    Result returned after validating a raster.
    """

    valid: bool
    metadata: RasterMetadata | None = None
    message: str | None = None