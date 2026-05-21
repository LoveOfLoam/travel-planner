from datetime import date
from typing import Any
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage
from app.core.logging import get_logger, log_timing
from app.core.json_utils import parse_llm_json

logger = get_logger("agents.travel")

# 各意图的 system prompt 模板
_SYSTEM_PROMPTS = {
    "itinerary_planning": """你是一个专业的旅游规划师。请根据用户需求和工具返回的数据，生成详细的每日行程安排。

今天的日期：{today_date}

用户信息：
- 目的地：{destination}
- 出发地：{origin}
- 旅行天数：{days}天
- 总预算：{budget}元
- 人数：{people}人
- 必去地点：{must_visit}

你需要：
1. 同时调用以下工具获取数据（可以并行调用以节省时间）：
   - maps_text_search 搜索目的地的景点、美食、住宿
   - maps_weather 查询天气预报
   - maps_geo 获取城市坐标（如有出发地同时获取出发地坐标）
2. 获取坐标后，如有出发地，调用 maps_direction_driving 和 maps_distance 查询交通
3. 汇总所有数据生成行程（不要再调用新的工具）

注意：每个 day 条目和 forecast 条目必须包含 "date" 字段，从 {today_date} 开始依次递增。
最终输出必须是以下 JSON 格式（不要输出其他文字）：
{{
  "itinerary": {{
    "days": [
      {{
        "day": 1,
        "date": "5月21日",
        "activities": [
          {{
            "time": "09:00",
            "title": "景点名称",
            "description": "简要描述",
            "cost": 预估费用数字,
            "duration": "预计时长",
            "transport": "交通方式",
            "location": {{"longitude": 经度, "latitude": 纬度}}
          }}
        ]
      }}
    ]
  }},
  "weather": {{
    "destination": "城市名",
    "forecast": [{{"day": 1, "date": "5月21日", "weather": "晴", "temperature": "20-28°C", "suggestion": "建议"}}],
    "packing_tips": ["物品1", "物品2"]
  }},
  "transport": {{
    "options": [{{"type": "高铁", "duration": "时长", "cost": "费用", "description": "说明"}}],
    "local_transport": {{"recommendation": "建议", "options": ["地铁", "公交"]}}
  }},
  "budget": {{
    "total_budget": 数字,
    "breakdown": [{{"category": "住宿", "amount": 数字, "percentage": 数字}}]
  }},
  "summary": "一段简洁的中文总结，需包含具体日期"
}}""",

    "weather_query": """你是一个气象顾问。请查询目的地天气并提供建议。

今天的日期：{today_date}

用户信息：
- 目的地：{destination}
- 查询天数：{days}天

你需要：
1. 用 maps_weather 查询天气预报
2. 用 maps_geo 获取城市坐标（如需要）

注意：forecast 中每个条目必须包含 "date" 字段，从 {today_date} 开始依次递增。
最终输出必须是以下 JSON 格式（不要输出其他文字）：
{{
  "weather": {{
    "destination": "城市名",
    "forecast": [{{"day": 1, "date": "5月21日", "weather": "晴", "temperature": "20-28°C", "suggestion": "穿衣建议"}}],
    "packing_tips": ["建议携带物品"]
  }},
  "summary": "一段简洁的天气总结，需包含具体日期"
}}""",

    "transport_query": """你是一个交通出行顾问。请查询交通路线方案。

用户信息：
- 出发地：{origin}
- 目的地：{destination}

你需要：
1. 用 maps_geo 分别编码出发地和目的地
2. 用 maps_direction_driving 查询驾车路线
3. 用 maps_distance 查询距离

最终输出必须是以下 JSON 格式（不要输出其他文字）：
{{
  "transport": {{
    "options": [{{"type": "高铁", "duration": "时长", "cost": "费用", "description": "说明"}}],
    "local_transport": {{"recommendation": "建议", "options": ["地铁", "公交"]}}
  }},
  "summary": "一段简洁的交通方案总结"
}}""",

    "poi_search": """你是一个旅游推荐官。请搜索并推荐景点或餐厅。

用户信息：
- 目的地：{destination}
- 搜索需求：{must_visit}

你需要：
1. 用 maps_text_search 搜索相关景点或餐厅
2. 用 maps_geo 获取坐标信息（如需要）

最终输出必须是以下 JSON 格式（不要输出其他文字）：
{{
  "pois": [
    {{
      "name": "名称",
      "address": "地址",
      "type": "类型",
      "rating": "评分",
      "description": "推荐理由"
    }}
  ],
  "summary": "一段简洁的推荐总结"
}}""",

    "budget_advice": """你是一个旅行预算顾问。请根据用户信息提供预算建议。

用户信息：
- 目的地：{destination}
- 旅行天数：{days}天
- 预算：{budget}元
- 人数：{people}人

不需要调用任何工具，请直接根据你的知识给出预算建议。

最终输出必须是以下 JSON 格式（不要输出其他文字）：
{{
  "budget": {{
    "total_budget": 数字,
    "breakdown": [{{"category": "住宿", "amount": 数字, "percentage": 数字}}]
  }},
  "summary": "一段简洁的预算建议总结"
}}""",
}


class TravelAgent:
    """主旅行 Agent：基于 LangGraph ReAct 模式，自主选择 MCP 工具"""

    def __init__(self, llm: Any, tools: list):
        self._llm = llm
        self._tools = tools
        if tools:
            self._agent = create_react_agent(llm, tools)
        else:
            self._agent = None

    # 意图类型 → 参与的 agent_id（与 tool_wrapper 的 TOOL_AGENT_MAP 保持一致）
    _INTENT_AGENTS: dict[str, tuple[str, ...]] = {
        "itinerary_planning": ("itinerary", "transport", "weather"),
        "weather_query": ("weather",),
        "transport_query": ("transport",),
        "poi_search": ("itinerary",),
        "budget_advice": ("budget",),
    }

    async def run(
        self,
        user_message: str,
        intent: dict,
        event_bus=None,
        session_id: str = None,
    ) -> dict:
        intent_type = intent["type"]
        logger.info(f"[travel_agent] 开始执行 | intent={intent_type} | tools_count={len(self._tools)}")

        system_prompt = self._build_system_prompt(intent)
        active_agents = self._INTENT_AGENTS.get(intent_type, ())

        if self._tools and self._agent:
            return await self._run_with_tools(user_message, system_prompt, event_bus, session_id, active_agents)
        else:
            return await self._run_without_tools(user_message, system_prompt, event_bus, session_id, active_agents)

    async def _run_with_tools(
        self, user_message: str, system_prompt: str,
        event_bus=None, session_id: str = None,
        active_agents: tuple[str, ...] = (),
    ) -> dict:
        logger.info(f"[travel_agent] 使用 LangGraph Agent 执行")

        if event_bus and session_id:
            await event_bus.publish(session_id, {
                "type": "agent_progress",
                "agent_id": "itinerary",
                "data": {"message": "智能助手正在分析和查询数据..."},
            })

        async with log_timing(logger, "[travel_agent] ReAct Agent 执行"):
            try:
                result = await self._agent.ainvoke({
                    "messages": [
                        SystemMessage(content=system_prompt),
                        {"role": "user", "content": user_message},
                    ],
                }, config={"recursion_limit": 10})
            except Exception as e:
                logger.error(f"[travel_agent] Agent 执行失败 | error={e}", exc_info=True)
                return await self._run_without_tools(user_message, system_prompt, event_bus, session_id, active_agents)

        parsed = self._extract_agent_result(result)

        if self._is_recursion_limit_error(parsed):
            logger.warning("[travel_agent] ReAct Agent 因步数限制未完成，使用工具数据回退直接生成")
            return await self._generate_from_tool_context(
                result, system_prompt, user_message, event_bus, session_id, active_agents,
            )

        return parsed

    async def _run_without_tools(
        self, user_message: str, system_prompt: str,
        event_bus=None, session_id: str = None,
        active_agents: tuple[str, ...] = (),
    ) -> dict:
        """无工具时直接调用 LLM（如 budget_advice 或工具调用失败的回退）"""
        logger.info(f"[travel_agent] 无可用工具，直接调用 LLM")

        async with log_timing(logger, "[travel_agent] 纯 LLM 调用"):
            response = await self._llm.ainvoke(
                f"{system_prompt}\n\n用户消息：{user_message}"
            )

        if event_bus and session_id:
            for agent_id in active_agents:
                await event_bus.publish(session_id, {
                    "type": "agent_complete",
                    "agent_id": agent_id,
                    "data": {"message": "已完成", "status": "done"},
                })

        content = response.content
        return self._parse_json_response(content)

    @staticmethod
    def _is_recursion_limit_error(parsed: dict) -> bool:
        summary = parsed.get("summary", "")
        if not summary or len(parsed) > 1:
            return False
        return "need more steps" in summary.lower()

    async def _generate_from_tool_context(
        self, agent_result: dict, system_prompt: str, user_message: str,
        event_bus=None, session_id: str = None,
        active_agents: tuple[str, ...] = (),
    ) -> dict:
        tool_outputs: list[str] = []
        for msg in agent_result.get("messages", []):
            if hasattr(msg, "type") and msg.type == "tool":
                content = getattr(msg, "content", "")
                name = getattr(msg, "name", "")
                if content:
                    tool_outputs.append(f"[{name}]\n{content}")

        context = "\n\n".join(tool_outputs) if tool_outputs else "无工具数据"
        prompt = (
            f"{system_prompt}\n\n"
            f"以下是通过工具查询到的真实数据，请严格基于这些数据生成最终 JSON 输出：\n\n{context}\n\n"
            f"用户消息：{user_message}"
        )

        logger.info(f"[travel_agent] 使用 {len(tool_outputs)} 条工具结果回退生成 | prompt_length={len(prompt)}")
        async with log_timing(logger, "[travel_agent] 回退 LLM 调用"):
            response = await self._llm.ainvoke(prompt)

        if event_bus and session_id:
            for agent_id in active_agents:
                await event_bus.publish(session_id, {
                    "type": "agent_complete",
                    "agent_id": agent_id,
                    "data": {"message": "已完成", "status": "done"},
                })

        return self._parse_json_response(response.content)

    def _build_system_prompt(self, intent: dict) -> str:
        """根据意图构建 system prompt"""
        intent_type = intent["type"]
        template = _SYSTEM_PROMPTS.get(intent_type, _SYSTEM_PROMPTS["itinerary_planning"])
        today = date.today()

        return template.format(
            today_date=f"{today.month}月{today.day}日",
            destination=intent.get("destination") or "未知",
            origin=intent.get("origin") or "未知",
            days=intent.get("days") or 3,
            budget=intent.get("budget") or 5000,
            people=intent.get("people") or 1,
            must_visit=", ".join(intent.get("must_visit") or []) or "无",
        )

    def _extract_agent_result(self, result: dict) -> dict:
        """从 LangGraph Agent 结果中提取最终响应"""
        messages = result.get("messages", [])
        if not messages:
            return {"summary": "未能生成结果"}

        # 取最后一条没有 tool_calls 的 AI 消息（跳过工具调用的中间消息）
        for msg in reversed(messages):
            if hasattr(msg, "type") and msg.type == "ai":
                has_tool_calls = hasattr(msg, "tool_calls") and msg.tool_calls
                if has_tool_calls:
                    continue
                content = getattr(msg, "content", "")
                if content:
                    return self._parse_json_response(content)

        # fallback: 取最后一条消息
        last_msg = messages[-1]
        content = getattr(last_msg, "content", "")
        return self._parse_json_response(content)

    def _parse_json_response(self, content: str) -> dict:
        return parse_llm_json(content)
