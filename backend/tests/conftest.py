import pytest
import pytest_asyncio
from mongomock_motor import AsyncMongoMockClient


@pytest_asyncio.fixture
async def mock_db():
    client = AsyncMongoMockClient()
    db = client["test_travel_planner"]
    yield db
    client.close()
