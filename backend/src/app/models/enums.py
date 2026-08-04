from enum import Enum


class RasterType(str, Enum):
    DEM = "dem"
    SATELLITE = "satellite"
    LAND_COVER = "land_cover"
    SLOPE = "slope"
    ASPECT = "aspect"
    HILLSHADE = "hillshade"
    PREDICTION = "prediction"
    UNCERTAINTY = "uncertainty"
    OTHER = "other"


class RasterSource(str, Enum):
    UPLOADED = "uploaded"
    GENERATED = "generated"
    IMPORTED = "imported"


class RasterStatus(str, Enum):
    UPLOADING = "uploading"
    READY = "ready"
    PROCESSING = "processing"
    FAILED = "failed"