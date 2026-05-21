import redis.asyncio as redis
from app.core.config import get_settings

_redis: redis.Redis | None = None


async def connect_redis() -> None:
    global _redis
    settings = get_settings()
    _redis = redis.from_url(settings.redis_url, decode_responses=True)


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.close()
        _redis = None


def get_redis() -> redis.Redis:
    if _redis is None:
        raise RuntimeError("Redis not connected. Call connect_redis() first.")
    return _redis
