from datetime import date, datetime, timezone
from enum import Enum
from sqlmodel import Field, SQLModel

class WatchStatus(str, Enum):
    UNWATCHED = "unwatched"
    PLANNED = "planned"
    WATCHED = "watched"
    STOPPED = "stopped"
    
class MediaBase(SQLModel):
    title: str = Field(min_length=1, max_length=300, index=True)
    date_watched: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    comments: str | None = None
    viewer_id: int = Field(index=True)
    status: WatchStatus = WatchStatus.UNWATCHED
    stop_reason: str | None = None
    
class Media(MediaBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class MediaCreate(MediaBase):
    pass 

class MediaUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    date_watched: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    comments: str | None = None
    viewer_id: int | None = None
    status: WatchStatus | None = None
    stop_reason: str | None = None
    