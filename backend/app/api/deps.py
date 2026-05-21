from fastapi import Request
from app.core.database import get_db
from app.core.redis import get_redis
from app.services.mcp_manager import MCPManager


async def get_database():
    return get_db()


async def get_redis_client():
    return get_redis()


def get_mcp_manager(request: Request) -> MCPManager:
    manager = getattr(request.app.state, "mcp_manager", None)
    if manager is None:
        raise RuntimeError("MCPManager 未初始化，请检查应用启动流程")
    return manager
