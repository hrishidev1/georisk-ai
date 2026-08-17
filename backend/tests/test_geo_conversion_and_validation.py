import pytest
from app.exceptions import InvalidGeometryError, InvalidGeoJSONError
from app.geo.schemas import GeoJSONFeature, GeoJSONPolygon
from app.geo.validation import validate_feature
from app.geo.conversion import feature_to_geometry, geometry_to_feature


def test_validate_feature_valid_polygon():
    feature = GeoJSONFeature(
        geometry=GeoJSONPolygon(
            type="Polygon",
            coordinates=[
                [
                    [10.0, 45.0],
                    [11.0, 45.0],
                    [11.0, 46.0],
                    [10.0, 46.0],
                    [10.0, 45.0],
                ]
            ],
        ),
        properties={"name": "Test Study Area"},
    )
    # Should not raise
    validate_feature(feature)


def test_validate_feature_invalid_self_intersecting():
    # Bowtie / self-intersecting polygon
    feature = GeoJSONFeature(
        geometry=GeoJSONPolygon(
            type="Polygon",
            coordinates=[
                [
                    [0.0, 0.0],
                    [1.0, 1.0],
                    [0.0, 1.0],
                    [1.0, 0.0],
                    [0.0, 0.0],
                ]
            ],
        ),
        properties={},
    )
    with pytest.raises(InvalidGeometryError):
        validate_feature(feature)


def test_feature_conversion_roundtrip():
    original_feature = GeoJSONFeature(
        geometry=GeoJSONPolygon(
            type="Polygon",
            coordinates=[
                [
                    [10.0, 45.0],
                    [11.0, 45.0],
                    [11.0, 46.0],
                    [10.0, 46.0],
                    [10.0, 45.0],
                ]
            ],
        ),
        properties={"test_prop": 123},
    )

    # Convert to PostGIS WKBElement
    wkb_geom = feature_to_geometry(original_feature)
    assert wkb_geom is not None

    # Convert back to GeoJSONFeature
    converted_feature = geometry_to_feature(wkb_geom, properties=original_feature.properties)
    assert converted_feature.geometry.type == "Polygon"
    assert len(converted_feature.geometry.coordinates[0]) == 5
    assert converted_feature.properties["test_prop"] == 123
