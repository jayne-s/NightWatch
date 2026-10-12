import os
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = os.getenv("MEDIA_DATABASE_URL", "sqlite:///./media.db",)
connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
def get_session():
    with Session(engine) as session:
        yield session