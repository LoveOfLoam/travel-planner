from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agent_id: Optional[str] = None


class ChatSession(BaseModel):
    trip_id: Optional[str] = None
    user_id: str
    messages: list[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    trip_id: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    message: Message
