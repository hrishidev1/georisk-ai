class RasterError(Exception):
    """Base exception for raster processing."""


class InvalidRasterError(RasterError):
    """Raised when a file is not a valid raster."""


class UnsupportedRasterFormatError(RasterError):
    """Raised when the raster format is not supported."""


class RasterValidationError(RasterError):
    """Raised when raster validation fails."""


class RasterMetadataError(RasterError):
    """Raised when raster metadata cannot be extracted."""


class MissingCRSError(RasterValidationError):
    """Raised when a raster has no Coordinate Reference System."""


class EmptyRasterError(RasterValidationError):
    """Raised when a raster contains no data."""


class CorruptedRasterError(RasterValidationError):
    """Raised when a raster cannot be opened or is corrupted."""


class RasterTooLargeError(RasterValidationError):
    """Raised when a raster exceeds the configured upload limit."""