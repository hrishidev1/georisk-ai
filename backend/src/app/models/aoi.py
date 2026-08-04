from __future__ import annotations

from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.timestampedmodel import TimestampedModel
from app.geo.constants import DEFAULT_SRID


class AOI(TimestampedModel):
    __tablename__ = "aois"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    geometry: Mapped[WKBElement] = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=DEFAULT_SRID,
            spatial_index=True,
        ),
        nullable=False,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey(
            "projects.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    project: Mapped["Project"] = relationship(
        back_populates="aois",
    )