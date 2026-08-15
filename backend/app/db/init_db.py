from backend.app.core.database import engine, Base, get_db_engine
from backend.app.models import *
from backend.app.db.seed_taxonomy import seed_taxonomy

def init_db(db_url: str = None):
    print("[INIT] Initializing Banking Coach Production Database Architecture...")
    eng = engine if db_url is None else get_db_engine(db_url)
    
    # Create all tables defined across Content, Learning, and Admin domains
    Base.metadata.create_all(bind=eng)
    print("[SUCCESS] All database tables, check constraints, foreign keys, and indexes created successfully!")
    
    # Run Taxonomy Seed Data
    from sqlalchemy.orm import sessionmaker
    SessionTemp = sessionmaker(bind=eng)
    session = SessionTemp()
    try:
        seed_taxonomy(session)
    finally:
        session.close()

if __name__ == "__main__":
    init_db()
