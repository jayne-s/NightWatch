from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .database import create_db_and_tables, get_session
from .models import Viewer, ViewerCreate

app = FastAPI(title="Watch Tracker Viewer Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SessionDep = Annotated[Session, Depends(get_session)]


@app.on_event("startup")
def startup():
    create_db_and_tables()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/viewers/", response_model=Viewer, status_code=201)
def create_viewer(payload: ViewerCreate, session: SessionDep):
    name = payload.name.strip()
    if not name:
        raise HTTPException(422, "Viewer name cannot be blank.")

    existing = session.exec(
        select(Viewer).where(Viewer.name == name)
    ).first()

    if existing:
        raise HTTPException(409, "Viewer already exists.")

    viewer = Viewer(name=name)
    session.add(viewer)
    session.commit()
    session.refresh(viewer)
    return viewer


@app.get("/viewers/", response_model=list[Viewer])
def list_viewers(session: SessionDep):
    return session.exec(
        select(Viewer).order_by(Viewer.name)
    ).all()


@app.delete("/viewers/{viewer_id}", status_code=204)
def delete_viewer(viewer_id: int, session: SessionDep):
    viewer = session.get(Viewer, viewer_id)
    if viewer is None:
        raise HTTPException(404, "Viewer not found.")

    session.delete(viewer)
    session.commit()
    return None
