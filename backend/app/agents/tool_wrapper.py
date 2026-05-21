import asyncio
from typing import Any, Callable, Optional, Type
from pydantic import BaseModel, PrivateAttr
from langchain_core.tools import BaseTool
from langchain_core.utils.pydantic import is_basemodel_subclass
from app.core.logging import get_logger

logger = get_logger("agents.tool_wrapper")


def _get_tool_args_schema(tool: BaseTool):
    """Safely get args_schema from a tool. Supports both Pydantic models and JSON Schema dicts (used by MCP tools)."""
    schema = getattr(tool, "args_schema", None)
    if schema is None:
        return None
    if isinstance(schema, dict):
        return schema
    if is_basemodel_subclass(schema):
        return schema
    return None


class EventEmittingToolWrapper(BaseTool):
    """包装 MCP 工具，在调用前/后发布 SSE 事件，使用信号量限制并发。"""

    _tool: BaseTool = PrivateAttr()
    _agent_id: str = PrivateAttr()
    _emit_fn: Optional[Callable] = PrivateAttr(default=None)
    _semaphore: Optional[asyncio.Semaphore] = PrivateAttr(default=None)

    def __init__(
        self,
        tool: BaseTool,
        agent_id: str,
        emit_fn: Callable | None = None,
        semaphore: asyncio.Semaphore | None = None,
    ):
        super().__init__(
            name=tool.name,
            description=tool.description,
            args_schema=_get_tool_args_schema(tool),
        )
        self._tool = tool
        self._agent_id = agent_id
        self._emit_fn = emit_fn
        self._semaphore = semaphore

    async def _arun(self, *args: Any, **kwargs: Any) -> Any:
        acquired = False
        if self._semaphore:
            try:
                await asyncio.wait_for(self._semaphore.acquire(), timeout=30)
                acquired = True
            except asyncio.TimeoutError:
                return "工具调用超时：系统繁忙，请稍后重试"
        try:
            logger.info(f"[tool_wrapper] 调用工具 | tool={self.name} | agent_id={self._agent_id}")

            if self._emit_fn:
                await self._emit_fn("agent_start", self._agent_id, {
                    "message": f"正在查询 {self.name}...",
                })

            result = await self._tool.ainvoke(kwargs)
            logger.info(f"[tool_wrapper] 工具调用成功 | tool={self.name}")

            if self._emit_fn:
                await self._emit_fn("agent_complete", self._agent_id, {
                    "message": f"{self.name} 查询完成",
                    "status": "done",
                })

            return result
        except Exception as e:
            logger.error(f"[tool_wrapper] 工具调用失败 | tool={self.name} | error={e}")
            if self._emit_fn:
                await self._emit_fn("agent_complete", self._agent_id, {
                    "message": f"{self.name} 查询失败: {e}",
                    "status": "error",
                })
            return f"工具调用失败: {e}"
        finally:
            if acquired and self._semaphore:
                self._semaphore.release()

    def _run(self, *args: Any, **kwargs: Any) -> Any:
        return self._tool.invoke(kwargs)

    def __repr__(self):
        return f"EventEmittingToolWrapper({self.name} -> {self._agent_id})"


def wrap_tools_with_events(
    tools: list,
    agent_id_resolver: Callable[[str], str],
    emit_fn: Callable | None = None,
    rate_limiter: asyncio.Semaphore | None = None,
) -> list:
    """将 MCP 工具列表包装为带事件发布的工具"""
    wrapped = []
    for tool in tools:
        agent_id = agent_id_resolver(tool.name)
        wrapped.append(EventEmittingToolWrapper(tool, agent_id, emit_fn, rate_limiter))
        logger.debug(f"已包装工具 | tool={tool.name} -> agent_id={agent_id}")
    return wrapped
