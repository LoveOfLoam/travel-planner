from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class TravelStyle(str, Enum):
    ADVENTURE = "adventure"
    RELAXATION = "relaxation"
    CULTURAL = "cultural"
    FOODIE = "foodie"


class BudgetRange(str, Enum):
    BUDGET = "budget"
    MID = "mid"
    LUXURY = "luxury"


class UserPreferences(BaseModel):
    travel_style: Optional[TravelStyle] = None
    budget_range: Optional[BudgetRange] = None


class User(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    preferences: UserPreferences
