from shapely.geometry import shape
from shapely.errors import ShapelyError

from app.exceptions import (
    InvalidGeoJSONError,
    InvalidGeometryError,
)
from app.geo.schemas import GeoJSONFeature


def validate_feature(
    feature: GeoJSONFeature,
) -> None:
    try:
        geometry = shape(
            feature.geometry.model_dump()
        )
    except (
        ValueError,
        TypeError,
        ShapelyError,
    ) as exc:
        raise InvalidGeoJSONError() from exc

    if geometry.is_empty:
        raise InvalidGeometryError()

    if not geometry.is_valid:
        raise InvalidGeometryError()