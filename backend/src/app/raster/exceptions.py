from http import HTTPStatus

from app.exceptions.base import AppException


class RasterError(AppException):
    """Base exception for raster processing."""

    status_code = HTTPStatus.BAD_REQUEST
    detail = "A raster processing error occurred."


class InvalidRasterError(RasterError):
    """Raised when a file is not a valid raster."""

    detail = "The file is not a valid raster."


class UnsupportedRasterFormatError(RasterError):
    """Raised when the raster format is not supported."""

    detail = "Unsupported raster format."


class RasterValidationError(RasterError):
    """Raised when raster validation fails."""

    detail = "Raster validation failed."


class RasterMetadataError(RasterError):
    """Raised when raster metadata cannot be extracted."""

    detail = "Failed to extract raster metadata."


class MissingCRSError(RasterValidationError):
    """Raised when a raster has no Coordinate Reference System."""

    detail = "Raster has no Coordinate Reference System."


class EmptyRasterError(RasterValidationError):
    """Raised when a raster contains no data."""

    detail = "Raster contains no data."


class CorruptedRasterError(RasterValidationError):
    """Raised when a raster cannot be opened or is corrupted."""

    detail = "Raster file is corrupted or cannot be opened."


class RasterTooLargeError(RasterValidationError):
    """Raised when a raster exceeds the configured upload limit."""

    status_code = HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    detail = "Raster file exceeds the maximum upload size."