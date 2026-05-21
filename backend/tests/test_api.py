import pytest
import pytest_asyncio
from unittest.mock import MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import connect_db, close_db
from app.core.redis import connect_redis, close_redis
from app.api.deps import get_mcp_manager


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """测试前连接数据库，测试后断开"""
    await connect_db()
    await connect_redis()
    yield
    await close_redis()
    await close_db()


@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_chat_endpoint_exists():
    mock_mcp = MagicMock()
    app.dependency_overrides[get_mcp_manager] = lambda: mock_mcp
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/chat",
                json={"message": "你好"},
            )
            assert response.status_code in [200, 500]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_trips_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 创建旅行计划
        response = await client.post(
            "/api/v1/trips",
            json={
                "title": "北京三日游",
                "destination": "北京",
                "budget": 5000,
                "num_people": 2,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "北京三日游"
        trip_id = data.get("id")

        # 获取旅行计划列表
        response = await client.get("/api/v1/trips")
        assert response.status_code == 200

        # 获取旅行计划详情
        if trip_id:
            response = await client.get(f"/api/v1/trips/{trip_id}")
            assert response.status_code == 200
