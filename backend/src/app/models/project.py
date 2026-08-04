from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.timestampedmodel import TimestampedModel

class Project(TimestampedModel):
    __tablename__ = "projects"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship(
        back_populates="projects",
    )

    aois: Mapped[list["AOI"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )

    rasters: Mapped[list["Raster"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )