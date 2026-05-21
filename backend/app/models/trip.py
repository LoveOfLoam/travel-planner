from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from enum import Enum


class TripStatus(str, Enum):
    PLANNING = "planning"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"


class Location(BaseModel):
    type: str = "Point"
    coordinates: list[float] = Field(default_factory=lambda: [0.0, 0.0])


class Activity(BaseModel):
    time: str
    title: str
    location: Optional[Location] = None
    description: str = ""
    cost: float = 0.0
    duration: str = ""
    transport: str = ""


class DayPlan(BaseModel):
    day: int
    date: Optional[date] = None
    activities: list[Activity] = Field(default_factory=list)


class Trip(BaseModel):
    title: str
    creator_id: str
    collaborator_ids: list[str] = Field(default_factory=list)
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    num_people: int = 1
    status: TripStatus = TripStatus.PLANNING
    itinerary: list[DayPlan] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TripCreate(BaseModel):
    title: str
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    num_people: int = 1


class TripResponse(BaseModel):
    id: str
    title: str
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float
    num_people: int
    status: TripStatus
    itinerary: list[DayPlan]
    created_at: datetime
