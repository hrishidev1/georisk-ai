from geoalchemy2.elements import WKBElement
from geoalchemy2.shape import from_shape, to_shape
from shapely.errors import ShapelyError
from shapely.geometry import mapping, shape

from app.exceptions import (
    InvalidGeoJSONError,
)
from app.geo.constants import DEFAULT_SRID
from app.geo.schemas import (
    GeoJSONFeature,
    GeoJSONPolygon,
)

def feature_to_geometry(
    feature: GeoJSONFeature,
) -> WKBElement:
    try:
        shapely_geometry = shape(
            feature.geometry.model_dump()
        )
    except (
        ValueError,
        TypeError,
        ShapelyError,
    ) as exc:
        raise InvalidGeoJSONError() from exc

    return from_shape(
        shapely_geometry,
        srid=DEFAULT_SRID,
    )

def geometry_to_feature(
    geometry: WKBElement,
    *,
    properties: dict | None = None,
) -> GeoJSONFeature:
    shapely_geometry = to_shape(geometry)

    return GeoJSONFeature(
        geometry=GeoJSONPolygon.model_validate(
            mapping(shapely_geometry)
        ),
        properties=properties or {},
    )