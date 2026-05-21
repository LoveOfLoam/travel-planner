import json
import re
from typing import Any
from app.core.logging import get_logger
from app.core.json_utils import extract_json_from_markdown

logger = get_logger("orchestrator.task_router")

# 6 种细粒度意图定义
INTENT_PROMPT = """你是一个旅行需求分析助手。请从用户消息中提取信息并分类意图。

用户消息：{user_message}

请提取以下字段（JSON格式）：
- intent: 意图类型，必须是以下之一：
  * itinerary_planning: 用户想要完整的行程规划（包含景点、餐饮、住宿安排，如"帮我规划3天南京行程"）
  * weather_query: 用户只想查询天气（如"北京天气怎么样"、"上海会不会下雨"）
  * transport_query: 用户只想查询交通路线（如"从上海到南京怎么走"、"北京到西安高铁多久"）
  * poi_search: 用户只想搜索景点或餐厅（如"西安有什么好玩的"、"南京推荐的餐厅"）
  * budget_advice: 用户只想咨询预算相关（如"去三亚大概花多少钱"、"3天南京预算2000够吗"）
  * general: 非旅行相关（如"今天天气真好"、"你好"）
- destination: 目的地城市（如"南京"，必须是城市名不是景点名，未提及则为 null）
- origin: 出发地城市（如有，否则为 null）
- days: 旅行天数（整数，如未提及则为 null）
- budget: 预算金额（数字，如"1000元"则为 1000，如未提及则为 null）
- people: 人数（整数，如"一个人"则为 1，如未提及则为 null）
- must_visit: 用户明确提到想去的景点/地点列表（如["先锋书店", "玄武湖"]，不包含城市名，没有则为空数组）

注意事项：
- destination 必须是城市名，不是景点名
- must_visit 只包含用户明确提到的景点/地点
- 只返回 JSON，不要其他文字"""

# 关键词到意图的映射（优先级从高到低）
_KEYWORD_INTENT_MAP: list[tuple[list[str], str]] = [
    # 天气相关
    (["天气", "气温", "下雨", "温度", "阴天", "晴天", "台风", "下雨吗", "热不热", "冷不冷"], "weather_query"),
    # 交通相关
    (["怎么去", "怎么走", "路线", "交通", "驾车", "高铁", "火车", "飞机", "航班", "地铁", "公交", "打车", "多久到", "多远", "自驾"], "transport_query"),
    # 预算相关
    (["预算", "费用", "花多少钱", "花费", "贵不贵", "便宜"], "budget_advice"),
    # 景点搜索（不包含行程规划关键词）
    (["好玩的地方", "景点", "推荐", "餐厅", "美食", "住宿", "酒店", "民宿", "哪里好玩", "有什么玩的", "有什么好玩的", "好玩的"], "poi_search"),
    # 行程规划
    (["行程", "规划", "安排", "几天", "旅行", "旅游", "出游", "出差"], "itinerary_planning"),
]


class TaskRouter:
    """任务路由中枢：通过 LLM 解析用户意图，决定调用哪些子 Agent"""

    def __init__(self, redis_client, llm: Any = None):
        self._redis = redis_client
        self._llm = llm

    async def parse_intent(self, user_message: str, event_bus=None, session_id: str = None) -> dict:
        """解析用户意图，返回细粒度意图类型和提取的信息"""
        logger.info(f"开始解析意图 | message={user_message[:80]}")

        if event_bus and session_id:
            await event_bus.publish(session_id, {
                "type": "thinking",
                "data": {"message": "正在理解您的旅行需求..."},
            })

        intent_hint = self._keyword_precheck(user_message)
        if intent_hint == "general":
            logger.info("未匹配旅行关键词，返回 general 意图")
            return {"type": "general"}

        logger.info(f"关键词预检命中 | hint={intent_hint}")

        if self._llm is None:
            logger.warning("LLM 未配置，无法解析意图")
            return {"type": "general"}

        try:
            result = await self._parse_with_llm(user_message)
        except Exception as e:
            logger.error(f"LLM 意图解析失败 | error={e}", exc_info=True)
            # LLM 失败时用关键词预检结果兜底，并尝试提取结构化数据
            if intent_hint and intent_hint != "general":
                return {"type": intent_hint, "destination": None,
                        "days": self._extract_days(user_message),
                        "budget": None, "people": None, "origin": None, "must_visit": []}
            return {"type": "general"}

        # 如果 LLM 未提取到天数，尝试从消息文本中提取
        if result.get("days") is None:
            result["days"] = self._extract_days(user_message)

        # 发布意图解析完成事件
        if event_bus and session_id:
            await self._publish_intent_event(event_bus, session_id, result)

        logger.info(f"意图解析完成 | result={result}")
        return result

    # 中文天数表达 → 数字
    _DAYS_PATTERNS: list[tuple[str, int]] = [
        ("一个礼拜", 7), ("一个星期", 7), ("一周", 7),
        ("半个月", 15), ("一个月", 30),
        ("十天", 10), ("九天", 9), ("八天", 8), ("七天", 7),
        ("六天", 6), ("五天", 5), ("四天", 4), ("三天", 3),
        ("两天", 2), ("一天", 1),
    ]

    def _keyword_precheck(self, message: str) -> str:
        for keywords, intent in _KEYWORD_INTENT_MAP:
            for kw in keywords:
                if kw in message:
                    return intent
        return "general"

    def _extract_days(self, message: str) -> int | None:
        # 数字+天 (如 "3天", "5天", "4天3晚")
        m = re.search(r"(\d+)\s*天", message)
        if m:
            return int(m.group(1))
        for pattern, num in self._DAYS_PATTERNS:
            if pattern in message:
                return num
        return None

    async def _parse_with_llm(self, user_message: str) -> dict:
        """通过 LLM 提取旅行意图"""
        prompt = INTENT_PROMPT.format(user_message=user_message)
        logger.info(f"调用 LLM 解析意图 | prompt_length={len(prompt)} 字符")

        response = await self._llm.ainvoke(prompt)
        content = response.content
        logger.info(f"LLM 意图解析响应 | response_length={len(content)} 字符")

        try:
            cleaned = extract_json_from_markdown(content)
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning(f"LLM 返回非 JSON 内容，回退到关键词预检 | content={content[:200]}")
            raise ValueError(f"LLM returned non-JSON content")

        intent_type = parsed.get("intent", "general")
        valid_intents = {
            "itinerary_planning", "weather_query", "transport_query",
            "poi_search", "budget_advice", "general",
        }
        if intent_type not in valid_intents:
            logger.warning(f"LLM 返回无效意图 | intent={intent_type}，降级为 general")
            intent_type = "general"

        if intent_type == "general":
            return {"type": "general"}

        return {
            "type": intent_type,
            "destination": parsed.get("destination"),
            "days": int(parsed["days"]) if parsed.get("days") is not None else None,
            "budget": float(parsed["budget"]) if parsed.get("budget") is not None else None,
            "people": int(parsed["people"]) if parsed.get("people") is not None else None,
            "origin": parsed.get("origin"),
            "must_visit": parsed.get("must_visit") or [],
        }

    async def _publish_intent_event(self, event_bus, session_id: str, result: dict):
        """发布意图解析完成事件"""
        parts = []
        destination = result.get("destination")
        origin = result.get("origin")
        days = result.get("days")
        budget = result.get("budget")
        people = result.get("people")
        must_visit = result.get("must_visit") or []

        if destination:
            parts.append(f"目的地: {destination}")
        if origin:
            parts.append(f"出发地: {origin}")
        if days:
            parts.append(f"天数: {days}天")
        if budget:
            parts.append(f"预算: ¥{budget}")
        if people:
            parts.append(f"人数: {people}人")
        if must_visit:
            parts.append(f"必去: {', '.join(must_visit)}")

        await event_bus.publish(session_id, {
            "type": "intent_parsed",
            "data": {
                "message": "需求分析完成",
                "destination": destination,
                "days": days,
                "budget": budget,
                "people": people,
                "origin": origin,
                "must_visit": must_visit,
                "summary": " | ".join(parts) if parts else "旅行规划",
            },
        })
