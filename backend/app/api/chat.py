import uuid
import json
import asyncio
from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from app.models.chat import ChatRequest, ChatResponse, Message, MessageRole
from app.orchestrator.task_router import TaskRouter
from app.orchestrator.state_manager import StateManager
from app.orchestrator.event_bus import EventBus
from app.agents.travel_agent import TravelAgent
from app.agents.tool_wrapper import wrap_tools_with_events
from app.services.mcp_manager import MCPManager
from app.api.deps import get_database, get_redis_client, get_mcp_manager
from app.core.logging import get_logger, log_timing

logger = get_logger("api.chat")

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("")
async def send_message(
    request: ChatRequest,
    db=Depends(get_database),
    redis_client=Depends(get_redis_client),
    mcp_manager: MCPManager = Depends(get_mcp_manager),
):
    """发送消息，立即返回 session_id，实际编排在后台运行"""
    session_id = request.session_id or str(uuid.uuid4())
    logger.info(f"收到消息 | session={session_id} | message={request.message[:50]}...")

    state_manager = StateManager(redis_client)
    event_bus = EventBus(redis_client)
    task_id = await state_manager.create_task("chat")
    logger.info(f"任务已创建 | task_id={task_id}")

    asyncio.create_task(
        _run_orchestration(
            session_id=session_id,
            task_id=task_id,
            user_message=request.message,
            trip_id=request.trip_id,
            state_manager=state_manager,
            event_bus=event_bus,
            db=db,
            mcp_manager=mcp_manager,
        )
    )
    logger.info(f"后台编排任务已启动 | session={session_id} | task_id={task_id}")

    return {"session_id": session_id}


async def _run_orchestration(
    session_id: str,
    task_id: str,
    user_message: str,
    trip_id: str | None,
    state_manager: StateManager,
    event_bus: EventBus,
    db,
    mcp_manager: MCPManager,
):
    """后台编排：解析意图 → 智能体执行 → 汇总结果，全程发布 SSE 事件"""
    from app.core.config import build_llm

    logger.info(f"编排开始 | session={session_id} | task_id={task_id}")
    loop = asyncio.get_running_loop()
    total_start = loop.time()

    llm = build_llm()
    task_router = TaskRouter(redis_client=None, llm=llm)
    intent_type = "general"

    try:
        await event_bus.publish(session_id, {
            "type": "thinking",
            "data": {"message": "正在分析您的旅行需求..."},
        })

        async with log_timing(logger, "意图解析"):
            intent = await task_router.parse_intent(
                user_message, event_bus=event_bus, session_id=session_id
            )
        logger.info(f"意图解析结果 | type={intent['type']} | destination={intent.get('destination')}")

        intent_type = intent["type"]

        if intent_type == "general":
            response_text = "你好！我是旅游规划大师，请告诉我你想去哪里旅行，我会为你制定详细的行程方案。"
            trip_data = None
        else:
            async with log_timing(logger, f"智能体执行 ({intent_type})"):
                response_text, trip_data = await _run_agent(
                    intent, user_message, mcp_manager, event_bus, session_id, llm,
                )

        user_msg = Message(role=MessageRole.USER, content=user_message)
        assistant_msg = Message(role=MessageRole.ASSISTANT, content=response_text)
        async with log_timing(logger, "MongoDB 保存会话"):
            await db.chat_sessions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "session_id": session_id,
                    "trip_id": trip_id,
                    "messages": [user_msg.model_dump(), assistant_msg.model_dump()],
                }},
                upsert=True,
            )

        await state_manager.complete_task(task_id, {"response": response_text})

        await event_bus.publish(session_id, {
            "type": "complete",
            "data": {
                "response_text": response_text,
                "trip_data": trip_data,
                "intent": intent_type,
                "session_id": session_id,
            },
        })

        total_elapsed = loop.time() - total_start
        logger.info(f"编排完成 | session={session_id} | 总耗时={total_elapsed:.3f}s")

    except Exception as e:
        total_elapsed = loop.time() - total_start
        logger.exception(f"编排异常 | session={session_id} | 耗时={total_elapsed:.3f}s | error={e}")
        await event_bus.publish(session_id, {
            "type": "complete",
            "data": {
                "response_text": "抱歉，规划过程中出现了问题，请稍后重试。",
                "trip_data": None,
                "intent": intent_type,
                "session_id": session_id,
            },
        })


async def _run_agent(
    intent: dict,
    user_message: str,
    mcp_manager: MCPManager,
    event_bus: EventBus,
    session_id: str,
    llm,
) -> tuple[str, dict | None]:
    """运行主旅行 Agent"""
    intent_type = intent["type"]

    intent_labels = {
        "itinerary_planning": "行程规划",
        "weather_query": "天气查询",
        "transport_query": "交通查询",
        "poi_search": "景点搜索",
        "budget_advice": "预算咨询",
    }
    label = intent_labels.get(intent_type, "旅行规划")

    # 意图 → 参与的前端智能体 ID
    intent_agents_map = {
        "itinerary_planning": ["itinerary", "transport", "weather"],
        "weather_query": ["weather"],
        "transport_query": ["transport"],
        "poi_search": ["itinerary"],
        "budget_advice": ["budget"],
    }
    active_agents = intent_agents_map.get(intent_type, [])

    await event_bus.publish(session_id, {
        "type": "dispatching",
        "data": {
            "message": f"已识别需求「{label}」，正在启动智能助手...",
            "active_agents": active_agents,
            "destination": intent.get("destination"),
            "days": intent.get("days"),
            "budget": intent.get("budget"),
            "people": intent.get("people"),
            "origin": intent.get("origin"),
            "must_visit": intent.get("must_visit"),
        },
    })

    tools = mcp_manager.get_tools_for_intent(intent_type)
    logger.info(f"已获取 MCP 工具 | intent={intent_type} | tools={[t.name for t in tools]}")

    async def emit_fn(event_type, agent_id, data):
        await event_bus.publish(session_id, {
            "type": event_type,
            "agent_id": agent_id,
            "data": data,
        })

    wrapped_tools = wrap_tools_with_events(
        tools,
        agent_id_resolver=mcp_manager.get_agent_id_for_tool,
        emit_fn=emit_fn,
        rate_limiter=mcp_manager.rate_limiter,
    )

    agent = TravelAgent(llm=llm, tools=wrapped_tools)
    result = await agent.run(
        user_message=user_message,
        intent=intent,
        event_bus=event_bus,
        session_id=session_id,
    )

    response_text = _format_response(result)
    logger.info(f"响应格式化完成 | 长度={len(response_text)} 字符")

    return response_text, result


def _format_response(result: dict) -> str:
    """格式化 Agent 结果为用户友好的文本"""
    parts = []

    if "summary" in result:
        parts.append(result["summary"])

    if "itinerary" in result:
        days = result["itinerary"].get("days", [])
        if days:
            parts.append(f"\n\n行程安排：")
            for day in days:
                parts.append(f"\n第 {day['day']} 天：")
                for act in day.get("activities", []):
                    parts.append(f"  {act['time']} - {act['title']}")

    if "weather" in result:
        forecasts = result["weather"].get("forecast", [])
        if forecasts:
            parts.append(f"\n\n天气预报：")
            for f in forecasts:
                date_label = f.get('date', f"第{f['day']}天")
                parts.append(f"  {date_label}: {f['weather']} {f.get('temperature', '')}")

    if "transport" in result:
        options = result["transport"].get("options", [])
        if options:
            parts.append(f"\n\n交通方案：")
            for opt in options:
                parts.append(f"  {opt['type']}: {opt.get('duration', '')} {opt.get('cost', '')}")

    if "budget" in result:
        budget = result["budget"]
        parts.append(f"\n\n预算分析：")
        parts.append(f"总预算：{budget.get('total_budget', 0)} 元")
        for item in budget.get("breakdown", []):
            parts.append(f"  {item['category']}: {item['amount']} 元 ({item['percentage']}%)")

    if "pois" in result:
        parts.append(f"\n\n推荐景点/餐厅：")
        for poi in result["pois"][:10]:
            parts.append(f"  {poi.get('name', '')} - {poi.get('address', '')}")

    return "".join(parts) if parts else "规划完成！"


@router.get("/{session_id}/stream")
async def stream_events(session_id: str, redis_client=Depends(get_redis_client)):
    """SSE 流，接收 Agent 实时事件，收到 complete 事件后自动关闭"""
    event_bus = EventBus(redis_client)
    logger.info(f"SSE 连接建立 | session={session_id}")

    async def event_generator():
        last_timestamp = 0
        event_count = 0
        start_time = asyncio.get_running_loop().time()
        while True:
            events = await event_bus.get_events(session_id, since=last_timestamp)
            for event in events:
                last_timestamp = event.get("timestamp", 0)
                event_count += 1
                yield {"event": event["type"], "data": json.dumps(event)}
                if event.get("type") == "complete":
                    logger.info(f"SSE 流关闭 | session={session_id} | 共发送 {event_count} 个事件")
                    return
            if asyncio.get_running_loop().time() - start_time > 300:
                logger.warning(f"SSE 流超时关闭 | session={session_id} | 共发送 {event_count} 个事件")
                return
            await asyncio.sleep(0.3)

    return EventSourceResponse(event_generator())
