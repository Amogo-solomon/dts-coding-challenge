from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator, ConfigDict


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    due_date: datetime

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title must not be empty")
        if len(v) > 200:
            raise ValueError("Title must be 200 characters or fewer")
        return v

    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            from datetime import timezone
            v = v.replace(tzinfo=timezone.utc)
        return v


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    due_date: datetime
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
