import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlmodel import Session, select

from .database import get_session
from .models import Media, MediaCreate, MediaUpdate, WatchStatus


router = APIRouter(prefix="/media", tags=["media"])
SessionDep = Annotated[Session, Depends(get_session)]


def get_viewer_db_path() -> Path:
    database_url = os.getenv("VIEWER_DATABASE_URL", "sqlite:///./viewers.db")
    if not database_url.startswith("sqlite:///"):
        return Path(__file__).resolve().parents[2] / "viewers" / "viewers.db"

    relative_path = database_url.replace("sqlite:///", "", 1)
    if relative_path.startswith("/"):
        return Path(relative_path)

    return (Path(__file__).resolve().parents[2] / relative_path).resolve()


def viewer_exists(viewer_id: int) -> bool:
    viewer_db = get_viewer_db_path()
    if not viewer_db.exists():
        return False

    with sqlite3.connect(viewer_db) as connection:
        row = connection.execute(
            "SELECT 1 FROM viewer WHERE id = ?",
            (viewer_id,),
        ).fetchone()
        return row is not None


@router.post("/", response_model=Media, status_code=201)
def create_media(payload: MediaCreate, session: SessionDep):
    data = payload.model_dump()

    if not data.get("viewer_id"):
        raise HTTPException(422, "Choose a viewer before saving.")

    if not viewer_exists(data["viewer_id"]):
        raise HTTPException(422, "Selected viewer does not exist.")

    if data["status"] == WatchStatus.STOPPED and not (
        data.get("stop_reason") or ""
    ).strip():
        raise HTTPException(422, "A stop reason is required.")

    if data["status"] == WatchStatus.WATCHED and not data.get(
        "date_watched"
    ):
        raise HTTPException(422, "Date watched is required.")

    media = Media(**data)
    session.add(media)
    session.commit()
    session.refresh(media)
    return media

@router.get("/", response_model=list[Media])
def list_media(
    session: SessionDep,
    q: str = Query(default="", max_length=200),
    status: WatchStatus | None = None,
    viewer_id: int | None = None,
):
    statement = select(Media)

    if q.strip():
        pattern = f"%{q.strip()}%"
        statement = statement.where(
            or_(
                Media.title.ilike(pattern),
                Media.comments.ilike(pattern),
                Media.stop_reason.ilike(pattern),
            )
        )

    if status is not None:
        statement = statement.where(Media.status == status)

    if viewer_id is not None:
        statement = statement.where(Media.viewer_id == viewer_id)

    return session.exec(
        statement.order_by(Media.created_at.desc())
    ).all()
    
@router.patch("/{media_id}", response_model=Media)
def update_media(
    media_id: int,
    payload: MediaUpdate,
    session: SessionDep,
):
    media = session.get(Media, media_id)
    if media is None:
        raise HTTPException(404, "Media not found")

    updates = payload.model_dump(exclude_unset=True)
    candidate = {
        "status": media.status,
        "stop_reason": media.stop_reason,
        "date_watched": media.date_watched,
        "viewer_id": media.viewer_id,
    }
    candidate.update(updates)

    if not candidate.get("viewer_id"):
        raise HTTPException(422, "Choose a viewer before saving.")

    if not viewer_exists(candidate["viewer_id"]):
        raise HTTPException(422, "Selected viewer does not exist.")

    if candidate["status"] == WatchStatus.STOPPED and not (
        candidate.get("stop_reason") or ""
    ).strip():
        raise HTTPException(422, "A stop reason is required.")

    if candidate["status"] == WatchStatus.WATCHED and not (
        candidate.get("date_watched")
    ):
        raise HTTPException(422, "Date watched is required.")

    for key, value in updates.items():
        setattr(media, key, value)

    media.updated_at = datetime.now(timezone.utc)
    session.add(media)
    session.commit()
    session.refresh(media)
    return media

@router.delete("/{media_id}", status_code=204)
def delete_media(media_id: int, session: SessionDep):
    media = session.get(Media, media_id)
    if media is None:
        raise HTTPException(404, "Media not found")

    session.delete(media)
    session.commit()
    return None