from pathlib import Path

import rasterio
from rasterio.errors import RasterioIOError

from app.raster.constants import (
    MAX_UPLOAD_SIZE,
    SUPPORTED_EXTENSIONS,
)
from app.raster.exceptions import (
    CorruptedRasterError,
    EmptyRasterError,
    MissingCRSError,
    RasterTooLargeError,
    UnsupportedRasterFormatError,
)
from app.raster.io import RasterIO

def validate_extension(
    path: Path,
) -> None:
    """
    Ensure the file extension is supported.
    """

    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise UnsupportedRasterFormatError()


def validate_file_size(
    path: Path,
) -> None:
    """
    Ensure the raster does not exceed the configured size limit.
    """

    if path.stat().st_size > MAX_UPLOAD_SIZE:
        raise RasterTooLargeError()


def validate_dataset(
    path: Path,
) -> None:
    """
    Ensure the raster can be opened successfully.
    """

    try:
        with rasterio.open(path):
            pass
    except RasterioIOError as exc:
        raise CorruptedRasterError() from exc


def validate_crs(
    dataset: rasterio.DatasetReader,
) -> None:
    """
    Ensure the raster has a Coordinate Reference System.
    """

    if dataset.crs is None:
        raise MissingCRSError()


def validate_band_count(
    dataset: rasterio.DatasetReader,
) -> None:
    """
    Ensure the raster contains at least one band.
    """

    if dataset.count == 0:
        raise EmptyRasterError()


def validate_raster(
    path: Path,
) -> None:
    """
    Validate a raster before processing.
    """

    validate_extension(path)
    validate_file_size(path)
    validate_dataset(path)

    with RasterIO.open(path) as dataset:
        validate_crs(dataset)
        validate_band_count(dataset)