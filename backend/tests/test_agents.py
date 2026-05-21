import pytest
from unittest.mock import AsyncMock, MagicMock
from app.agents.travel_agent import TravelAgent
from app.agents.tool_wrapper import EventEmittingToolWrapper, wrap_tools_with_events


class TestTravelAgent:
    @pytest.mark.asyncio
    async def test_run_without_tools_budget_advice(self):
        """预算咨询不需要 MCP 工具，直接调用 LLM"""
        mock_llm = MagicMock()
        mock_llm.ainvoke = AsyncMock(
            return_value=MagicMock(
                content='{"budget": {"total_budget": 5000, "breakdown": [{"category": "交通", "amount": 1000, "percentage": 20}]}, "summary": "预算建议"}'
            )
        )
        agent = TravelAgent(llm=mock_llm, tools=[])
        result = await agent.run(
            user_message="去三亚大概花多少钱",
            intent={"type": "budget_advice", "destination": "三亚", "days": 3, "budget": 5000, "people": 1, "origin": None, "must_visit": []},
        )
        assert "budget" in result
        assert "summary" in result

    @pytest.mark.asyncio
    async def test_run_without_tools_weather(self):
        """天气查询无工具时 fallback 到纯 LLM"""
        mock_llm = MagicMock()
        mock_llm.ainvoke = AsyncMock(
            return_value=MagicMock(
                content='{"weather": {"destination": "北京", "forecast": [{"day": 1, "weather": "晴", "temperature": "15-25°C", "suggestion": "适合外出"}]}, "summary": "天气预报"}'
            )
        )
        agent = TravelAgent(llm=mock_llm, tools=[])
        result = await agent.run(
            user_message="北京天气怎么样",
            intent={"type": "weather_query", "destination": "北京", "days": 3, "budget": None, "people": None, "origin": None, "must_visit": []},
        )
        assert "weather" in result

    @pytest.mark.asyncio
    async def test_run_without_tools_itinerary(self):
        """行程规划无工具时 fallback 到纯 LLM"""
        mock_llm = MagicMock()
        mock_llm.ainvoke = AsyncMock(
            return_value=MagicMock(
                content='{"itinerary": {"days": [{"day": 1, "activities": [{"time": "09:00", "title": "天安门", "description": "参观", "cost": 0, "duration": "2小时"}]}]}, "summary": "行程规划"}'
            )
        )
        agent = TravelAgent(llm=mock_llm, tools=[])
        result = await agent.run(
            user_message="帮我规划3天北京行程",
            intent={"type": "itinerary_planning", "destination": "北京", "days": 3, "budget": 5000, "people": 1, "origin": None, "must_visit": []},
        )
        assert "itinerary" in result

    @pytest.mark.asyncio
    async def test_json_parse_failure_returns_summary(self):
        """JSON 解析失败时返回 summary"""
        mock_llm = MagicMock()
        mock_llm.ainvoke = AsyncMock(
            return_value=MagicMock(content="这不是一个有效的JSON")
        )
        agent = TravelAgent(llm=mock_llm, tools=[])
        result = await agent.run(
            user_message="测试",
            intent={"type": "budget_advice", "destination": "北京", "days": 3, "budget": 5000, "people": 1, "origin": None, "must_visit": []},
        )
        assert "summary" in result


class TestToolWrapper:
    def test_wrap_tools_with_events(self):
        """测试工具包装器的 agent_id 映射"""
        mock_tool1 = MagicMock()
        mock_tool1.name = "maps_text_search"
        mock_tool1.description = "text search"
        mock_tool2 = MagicMock()
        mock_tool2.name = "maps_weather"
        mock_tool2.description = "weather"
        mock_tool3 = MagicMock()
        mock_tool3.name = "maps_direction_driving"
        mock_tool3.description = "driving"

        from app.services.mcp_manager import TOOL_AGENT_MAP
        wrapped = wrap_tools_with_events(
            [mock_tool1, mock_tool2, mock_tool3],
            agent_id_resolver=lambda name: TOOL_AGENT_MAP.get(name, "itinerary"),
        )

        assert len(wrapped) == 3
        assert wrapped[0]._agent_id == "itinerary"
        assert wrapped[1]._agent_id == "weather"
        assert wrapped[2]._agent_id == "transport"

    def test_wrapper_name_property(self):
        """测试包装器的 name 属性"""
        mock_tool = MagicMock()
        mock_tool.name = "maps_geo"
        mock_tool.description = "地理编码"

        wrapper = EventEmittingToolWrapper(mock_tool, "itinerary")
        assert wrapper.name == "maps_geo"
        assert wrapper.description == "地理编码"
