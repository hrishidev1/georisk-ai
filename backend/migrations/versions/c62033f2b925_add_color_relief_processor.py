"""add color relief processor

Revision ID: c62033f2b925
Revises: 75305d877b28
Create Date: 2026-08-09 10:02:11.490110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c62033f2b925'
down_revision: Union[str, Sequence[str], None] = '75305d877b28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE processor_type ADD VALUE IF NOT EXISTS 'COLOR_RELIEF'"
    )


def downgrade() -> None:
    # PostgreSQL does not safely support removing an individual
    # value from an enum type. Keep downgrade intentionally empty.
    pass