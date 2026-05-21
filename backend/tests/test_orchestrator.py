# -*- coding: utf-8 -*-
import pytest
import pytest_asyncio
import json
from unittest.mock import AsyncMock, patch
from app.orchestrator.state_manager import StateManager
from app.orchestrator.event_bus import EventBus
from app.orchestrator.task_router import TaskRouter


@pytest.fixture
def mock_redis():
    """模拟 Redis 客户端"""
    store = {}

    class MockRedis:
        async def hset(self, key, mapping=None, **kwargs):
            if key not in store:
                store[key] = {}
            if mapping:
                store[key].update(mapping)

        async def hgetall(self, key):
            return store.get(key, {})

        async def expire(self, key, ttl):
            pass

        async def delete(self, key):
            store.pop(key, None)

        async def lpush(self, key, *values):
            if key not in store:
                store[key] = []
            store[key].extend(values)

        async def lrange(self, key, start, stop):
            return store.get(key, [])[start:stop + 1] if stop >= 0 else store.get(key, [])[start:]

        async def ltrim(self, key, start, stop):
            if key in store:
                store[key] = store[key][start:stop + 1]

    return MockRedis()


@pytest.mark.asyncio
async def test_create_task(mock_redis):
    sm = StateManager(mock_redis)
    task_id = await sm.create_task("test-task")
    assert task_id is not None

    state = await sm.get_state(task_id)
    assert state["status"] == "pending"
    assert state["progress"] == "0"


@pytest.mark.asyncio
async def test_update_progress(mock_redis):
    sm = StateManager(mock_redis)
    task_id = await sm.create_task("test-task")

    await sm.update_progress(task_id, 50, "running")
    state = await sm.get_state(task_id)
    assert state["progress"] == "50"
    assert state["status"] == "running"


@pytest.mark.asyncio
async def test_complete_task(mock_redis):
    sm = StateManager(mock_redis)
    task_id = await sm.create_task("test-task")

    result = {"itinerary": [{"day": 1, "activities": []}]}
    await sm.complete_task(task_id, result)
    state = await sm.get_state(task_id)

    assert state["status"] == "completed"
    assert state["progress"] == "100"
    assert "result" in state


@pytest.mark.asyncio
async def test_publish_event(mock_redis):
    bus = EventBus(mock_redis)
    event = {
        "type": "agent_progress",
        "agent_id": "itinerary",
        "progress": 50,
        "data": {"message": "test"},
    }
    await bus.publish("trip-123", event)


@pytest.mark.asyncio
async def test_get_events(mock_redis):
    bus = EventBus(mock_redis)
    event = {
        "type": "agent_complete",
        "agent_id": "itinerary",
        "progress": 100,
        "data": {"result": "done"},
    }
    await bus.publish("trip-123", event)
    events = await bus.get_events("trip-123")
    assert len(events) >= 1


@pytest.mark.asyncio
async def test_parse_intent_itinerary_planning(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "北京",
        "origin": None,
        "days": 3,
        "budget": None,
        "people": None,
        "must_visit": [],
        "intent": "itinerary_planning",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("帮我规划一个3天的北京旅行")
    assert intent["type"] == "itinerary_planning"
    assert intent["destination"] == "北京"
    assert intent["days"] == 3


@pytest.mark.asyncio
async def test_parse_intent_weather_query(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "北京",
        "origin": None,
        "days": 3,
        "budget": None,
        "people": None,
        "must_visit": [],
        "intent": "weather_query",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("北京天气怎么样")
    assert intent["type"] == "weather_query"
    assert intent["destination"] == "北京"


@pytest.mark.asyncio
async def test_parse_intent_transport_query(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "南京",
        "origin": "上海",
        "days": None,
        "budget": None,
        "people": None,
        "must_visit": [],
        "intent": "transport_query",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("从上海到南京怎么走")
    assert intent["type"] == "transport_query"
    assert intent["origin"] == "上海"
    assert intent["destination"] == "南京"


@pytest.mark.asyncio
async def test_parse_intent_poi_search(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "西安",
        "origin": None,
        "days": None,
        "budget": None,
        "people": None,
        "must_visit": [],
        "intent": "poi_search",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("西安有什么好玩的")
    assert intent["type"] == "poi_search"
    assert intent["destination"] == "西安"


@pytest.mark.asyncio
async def test_parse_intent_budget_advice(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "三亚",
        "origin": None,
        "days": 3,
        "budget": 5000,
        "people": 1,
        "must_visit": [],
        "intent": "budget_advice",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("去三亚大概花多少钱")
    assert intent["type"] == "budget_advice"
    assert intent["destination"] == "三亚"


@pytest.mark.asyncio
async def test_parse_intent_must_visit(mock_redis):
    mock_llm = AsyncMock()
    mock_llm.ainvoke.return_value.content = json.dumps({
        "destination": "南京",
        "origin": "芜湖",
        "days": 2,
        "budget": 1000.0,
        "people": 1,
        "must_visit": ["先锋书店", "玄武湖"],
        "intent": "itinerary_planning",
    }, ensure_ascii=False)
    router = TaskRouter(mock_redis, llm=mock_llm)
    intent = await router.parse_intent("我在芜湖，想去南京玩，想去先锋书店，玄武湖，预算1000")
    assert intent["type"] == "itinerary_planning"
    assert intent["destination"] == "南京"
    assert intent["origin"] == "芜湖"
    assert intent["must_visit"] == ["先锋书店", "玄武湖"]
    assert intent["budget"] == 1000.0
    assert intent["people"] == 1


@pytest.mark.asyncio
async def test_parse_intent_general(mock_redis):
    router = TaskRouter(mock_redis)
    intent = await router.parse_intent("你好")
    assert intent["type"] == "general"


@pytest.mark.asyncio
async def test_keyword_precheck_weather(mock_redis):
    router = TaskRouter(mock_redis)
    hint = router._keyword_precheck("北京天气怎么样")
    assert hint == "weather_query"


@pytest.mark.asyncio
async def test_keyword_precheck_transport(mock_redis):
    router = TaskRouter(mock_redis)
    hint = router._keyword_precheck("从上海到南京怎么走")
    assert hint == "transport_query"


@pytest.mark.asyncio
async def test_keyword_precheck_general(mock_redis):
    router = TaskRouter(mock_redis)
    hint = router._keyword_precheck("今天心情不错")
    assert hint == "general"
