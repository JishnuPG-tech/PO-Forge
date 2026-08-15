from sqlalchemy import create_engine, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

# Base Declarative Model
Base = declarative_base()

# Attempt to load pgvector Vector type
try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False
    Vector = lambda dim: JSON  # Fallback type for SQLite/non-pgvector test environments

def get_db_engine(db_url: str = None):
    url = db_url or settings.get_database_url()
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    try:
        eng = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
        # Test connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"[DB] PostgreSQL unavailable ({e}). Falling back to local SQLite database (sqlite:///./poforge_prod.db).")
        sqlite_url = "sqlite:///./poforge_prod.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = get_db_engine()
from backend.app.models import content, learning  # Ensure models are registered
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
