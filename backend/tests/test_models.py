import pytest
from datetime import date, datetime
from app.models.user import User, UserCreate
from app.models.trip import Trip, TripCreate, DayPlan, Activity
from app.models.chat import ChatSession, Message, MessageRole


class TestUserModel:
    def test_create_user(self):
        user = User(name="张三", email="zhangsan@example.com")
        assert user.name == "张三"
        assert user.email == "zhangsan@example.com"
        assert user.preferences.travel_style is None

    def test_user_create_schema(self):
        data = UserCreate(name="李四", email="lisi@example.com")
        assert data.name == "李四"


class TestTripModel:
    def test_create_trip(self):
        trip = Trip(
            title="北京三日游",
            creator_id="user123",
            destination="北京",
            budget=5000.0,
            num_people=2,
        )
        assert trip.title == "北京三日游"
        assert trip.status == "planning"
        assert len(trip.itinerary) == 0

    def test_trip_with_itinerary(self):
        trip = Trip(
            title="北京三日游",
            creator_id="user123",
            destination="北京",
            itinerary=[
                DayPlan(day=1, activities=[
                    Activity(time="09:00", title="天安门广场", cost=0),
                    Activity(time="11:00", title="故宫博物院", cost=60),
                ]),
            ],
        )
        assert len(trip.itinerary) == 1
        assert trip.itinerary[0].activities[0].title == "天安门广场"


class TestChatModel:
    def test_create_message(self):
        msg = Message(role=MessageRole.USER, content="帮我规划北京旅行")
        assert msg.role == "user"
        assert msg.content == "帮我规划北京旅行"

    def test_chat_session(self):
        session = ChatSession(
            user_id="user123",
            messages=[
                Message(role=MessageRole.USER, content="你好"),
                Message(role=MessageRole.ASSISTANT, content="你好！我是旅游规划大师"),
            ],
        )
        assert len(session.messages) == 2
