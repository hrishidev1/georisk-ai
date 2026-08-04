from app.geo.schemas import GeoJSONFeature

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AOICreate(BaseModel):
    name: str
    description: str | None = None

    feature: GeoJSONFeature

class AOIUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

    feature: GeoJSONFeature | None = None


class AOIResponse(BaseModel):
    id: int

    name: str
    description: str | None

    project_id: int

    created_at: datetime
    updated_at: datetime

    feature: GeoJSONFeature

    model_config = ConfigDict(
        from_attributes=True,
    )