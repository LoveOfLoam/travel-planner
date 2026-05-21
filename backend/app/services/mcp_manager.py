import asyncio
import copy
import json
from pathlib import Path
from typing import Optional
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from app.core.logging import get_logger

logger = get_logger("services.mcp_manager")

# 意图到所需 MCP 工具名的映射
INTENT_TOOLS_MAP: dict[str, list[str]] = {
    "itinerary_planning": [
        "maps_text_search", "maps_weather", "maps_direction_driving",
        "maps_geo", "maps_distance",
    ],
    "weather_query": ["maps_weather", "maps_geo"],
    "transport_query": ["maps_direction_driving", "maps_geo", "maps_distance"],
    "poi_search": ["maps_text_search", "maps_geo"],
    "budget_advice": [],
    "general": [],
}

# MCP 工具名到前端 agent_id 的映射（用于 SSE 事件兼容）
TOOL_AGENT_MAP: dict[str, str] = {
    "maps_text_search": "itinerary",
    "maps_geo": "itinerary",
    "maps_weather": "weather",
    "maps_direction_driving": "transport",
    "maps_distance": "transport",
    "maps_regeocode": "itinerary",
}

_MCP_CONFIG_PATH = Path(__file__).parent.parent.parent.parent / ".mcp.json"


def _load_mcp_server_configs() -> dict:
    """加载 MCP 服务器配置，优先用环境变量，否则读 .mcp.json。

    .mcp.json 中的 URL 可以使用 {AMAP_API_KEY} 占位符，
    启动时自动从 AMAP_API_KEY 环境变量注入。
    """
    from app.core.config import get_settings
    settings = get_settings()

    if settings.mcp_servers_json:
        try:
            servers = json.loads(settings.mcp_servers_json)
        except json.JSONDecodeError:
            logger.warning("MCP_SERVERS_JSON 解析失败，回退到 .mcp.json")
            servers = None
    else:
        servers = None

    if servers is None and _MCP_CONFIG_PATH.exists():
        with open(_MCP_CONFIG_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
        servers = raw.get("mcpServers", {})

    if not servers:
        logger.warning("未找到 MCP 服务器配置")
        return {}

    if settings.amap_api_key:
        servers = _inject_api_keys(servers, settings.amap_api_key)

    return servers


def _inject_api_keys(servers: dict, amap_key: str) -> dict:
    """将 API Key 注入 MCP 服务器 URL 中的占位符。"""
    result = copy.deepcopy(servers)
    for name, config in result.items():
        url = config.get("url", "")
        if "{AMAP_API_KEY}" in url:
            config["url"] = url.replace("{AMAP_API_KEY}", amap_key)
            logger.info(f"MCP 配置注入 API Key | server={name}")
    return result


class MCPManager:
    """MCP 工具统一管理器，基于 langchain-mcp-adapters，使用持久 session"""

    def __init__(self):
        self._client: Optional[MultiServerMCPClient] = None
        self._all_tools: list = []
        self._session_cms: list = []
        self._rate_limiter = asyncio.Semaphore(2)

    async def initialize(self):
        """初始化 MCP 客户端连接，建立持久 session 以复用连接"""
        configs = _load_mcp_server_configs()
        if not configs:
            logger.warning("无 MCP 服务器配置，跳过初始化")
            return

        self._client = MultiServerMCPClient(configs)
        logger.info(f"正在连接 MCP 服务器 | servers={list(configs.keys())}")

        for server_name, connection_config in configs.items():
            try:
                cm = self._client.session(server_name)
                session = await cm.__aenter__()
                self._session_cms.append(cm)
                tools = await load_mcp_tools(session, server_name=server_name)
                self._all_tools.extend(tools)
                logger.info(f"MCP 持久会话已建立 | server={server_name}")
            except Exception as e:
                logger.error(f"MCP 会话建立失败 | server={server_name} | error={e}", exc_info=True)

        tool_names = [t.name for t in self._all_tools]
        logger.info(f"MCP 工具加载完成 | count={len(self._all_tools)} | tools={tool_names}")

    @property
    def rate_limiter(self) -> asyncio.Semaphore:
        return self._rate_limiter

    def get_all_tools(self) -> list:
        return self._all_tools

    def get_tools_for_intent(self, intent_type: str) -> list:
        """根据意图类型过滤 MCP 工具"""
        tool_names = INTENT_TOOLS_MAP.get(intent_type, [])
        if not tool_names:
            return []
        return [t for t in self._all_tools if t.name in tool_names]

    def get_agent_id_for_tool(self, tool_name: str) -> str:
        """获取工具对应的前端 agent_id"""
        return TOOL_AGENT_MAP.get(tool_name, "itinerary")

    async def close(self):
        """关闭 MCP 客户端连接，退出所有持久 session"""
        for cm in reversed(self._session_cms):
            try:
                await cm.__aexit__(None, None, None)
            except Exception as e:
                logger.warning(f"MCP 会话关闭异常 | error={e}")
        self._session_cms.clear()
        self._all_tools.clear()
        self._client = None
        logger.info("MCP 客户端已关闭")
