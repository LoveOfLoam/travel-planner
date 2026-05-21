import uuid
import json
from app.core.logging import get_logger

logger = get_logger("orchestrator.state_mgr")


class StateManager:
    """Agent 任务状态管理引擎，基于 Redis 存储"""

    def __init__(self, redis_client):
        self._redis = redis_client
        self._prefix = "agent:state:"
        self._ttl = 3600  # 1 hour

    async def create_task(self, task_type: str) -> str:
        """创建新任务，返回 task_id"""
        task_id = str(uuid.uuid4())
        state = {
            "task_id": task_id,
            "task_type": task_type,
            "status": "pending",
            "progress": "0",
            "sub_agents": json.dumps([]),
            "result": "",
        }
        await self._redis.hset(f"{self._prefix}{task_id}", mapping=state)
        await self._redis.expire(f"{self._prefix}{task_id}", self._ttl)
        logger.info(f"创建任务 | task_id={task_id} | type={task_type}")
        return task_id

    async def get_state(self, task_id: str) -> dict:
        """获取任务状态"""
        result = await self._redis.hgetall(f"{self._prefix}{task_id}")
        logger.debug(f"获取状态 | task_id={task_id}")
        return result

    async def update_progress(
        self, task_id: str, progress: int, status: str = "running"
    ) -> None:
        """更新任务进度 (0-100)"""
        await self._redis.hset(
            f"{self._prefix}{task_id}",
            mapping={"progress": str(progress), "status": status},
        )
        logger.info(f"更新进度 | task_id={task_id} | progress={progress} | status={status}")

    async def update_sub_agents(self, task_id: str, sub_agents: list[dict]) -> None:
        """更新子 Agent 状态列表"""
        await self._redis.hset(
            f"{self._prefix}{task_id}",
            mapping={"sub_agents": json.dumps(sub_agents)},
        )
        logger.debug(f"更新子智能体状态 | task_id={task_id} | count={len(sub_agents)}")

    async def complete_task(self, task_id: str, result: dict) -> None:
        """标记任务完成"""
        await self._redis.hset(
            f"{self._prefix}{task_id}",
            mapping={
                "status": "completed",
                "progress": "100",
                "result": json.dumps(result),
            },
        )
        logger.info(f"任务完成 | task_id={task_id}")

    async def fail_task(self, task_id: str, error: str) -> None:
        """标记任务失败"""
        await self._redis.hset(
            f"{self._prefix}{task_id}",
            mapping={"status": "failed", "error": error},
        )
        logger.error(f"任务失败 | task_id={task_id} | error={error}")

    async def delete_task(self, task_id: str) -> None:
        """删除任务状态"""
        await self._redis.delete(f"{self._prefix}{task_id}")
        logger.info(f"任务已删除 | task_id={task_id}")
