import json
import time
from app.core.logging import get_logger

logger = get_logger("orchestrator.event_bus")


class EventBus:
    """SSE 事件总线，基于 Redis List 实现"""

    def __init__(self, redis_client):
        self._redis = redis_client
        self._prefix = "sse:events:"
        self._max_events = 100
        self._ttl = 3600

    async def publish(self, channel: str, event: dict) -> None:
        """发布事件到指定频道"""
        event["timestamp"] = time.time()
        key = f"{self._prefix}{channel}"
        await self._redis.lpush(key, json.dumps(event))
        await self._redis.ltrim(key, 0, self._max_events - 1)
        await self._redis.expire(key, self._ttl)
        logger.debug(f"事件已发布 | channel={channel} | type={event.get('type')}")

    async def get_events(
        self, channel: str, since: float = 0
    ) -> list[dict]:
        """获取频道事件，支持按时间过滤"""
        key = f"{self._prefix}{channel}"
        raw_events = await self._redis.lrange(key, 0, -1)
        events = []
        for raw in reversed(raw_events):
            event = json.loads(raw)
            if event.get("timestamp", 0) > since:
                events.append(event)
        if events:
            logger.debug(f"获取事件 | channel={channel} | count={len(events)}")
        return events

    async def clear_events(self, channel: str) -> None:
        """清空频道事件"""
        await self._redis.delete(f"{self._prefix}{channel}")
        logger.info(f"频道已清空 | channel={channel}")
