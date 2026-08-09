"""add COLOR_RELIEF to rastertype

Revision ID: 0d362aad239d
Revises: c62033f2b925
Create Date: 2026-08-09 12:12:51.549005

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d362aad239d'
down_revision: Union[str, Sequence[str], None] = 'c62033f2b925'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE rastertype ADD VALUE IF NOT EXISTS 'COLOR_RELIEF'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
