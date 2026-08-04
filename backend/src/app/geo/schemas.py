from typing import Any, Literal

from pydantic import BaseModel, Field


class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"]

    coordinates: list[list[list[float]]] = Field(
        description="GeoJSON Polygon coordinates."
    )


class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"

    geometry: GeoJSONPolygon

    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Spatial properties."
    )


class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"

    features: list[GeoJSONFeature]