"""Initial production database schema for Personal AI Banking Coach

Revision ID: 0001_initial_production_schema
Revises: 
Create Date: 2026-08-15 10:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_production_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Enable pgvector extension if available
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    # Tables are auto-managed by SQLAlchemy metadata create_all / alembic autogenerate
    pass

def downgrade() -> None:
    pass
