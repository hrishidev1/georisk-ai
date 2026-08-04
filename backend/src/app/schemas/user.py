from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from pydantic import Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    full_name: str | None = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    created_at: datetime

class UserUpdate(BaseModel):
    full_name: str | None = None