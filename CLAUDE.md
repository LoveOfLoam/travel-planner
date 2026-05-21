# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

旅游规划大师 (Travel Planning Master) - an AI-driven travel planning web application using multi-agent collaboration to generate travel itineraries. Users describe their travel needs in natural language (Chinese), and 4 specialized AI agents work in parallel to produce a complete travel plan with itinerary, budget analysis, transport options, and weather forecasts.

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, LangChain, Motor (async MongoDB), Redis, SSE-Starlette
- **Frontend**: React 18, TypeScript 5, Vite 5, Zustand 4
- **AI Model**: DeepSeek v4-pro via LangChain ChatOpenAI
- **External API**: Amap (高德地图) MCP server for real map/weather data
- **Databases**: MongoDB (persistence), Redis (task state + SSE event bus)

## Commands

### Backend
```bash
cd backend

# Run server
python -m uvicorn app.main:app --reload

# Run all tests
python -m pytest tests/ -v

# Run single test file
python -m pytest tests/test_agents.py -v

# Run single test
python -m pytest tests/test_agents.py::test_itinerary_agent_run -v

# Install dependencies
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend

# Dev server (port 5173, proxies /api to :8000)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Install dependencies
npm install
```

### Docker (all services)
```bash
docker-compose up
```

## Architecture

### Multi-Agent Orchestration Flow (SSE-First)

```
Frontend generates session_id → opens SSE → POST /api/v1/chat (returns immediately)
                                              ↓
                                    Background task starts:
                                    TaskRouter (intent parsing) → 4 Agents in parallel → Aggregator → SSE "complete"
                                         ↓                              ↓
                                   EventBus (Redis)               EventBus (Redis)
                                         ↓                              ↓
                                    SSE stream delivers all events to frontend in real-time
```

1. **TaskRouter** (`backend/app/orchestrator/task_router.py`) - Regex-based Chinese NLU. Extracts destination, origin, days, budget, people, must_visit from user message. Publishes `thinking` and `intent_parsed` events.
2. **StateManager** (`backend/app/orchestrator/state_manager.py`) - Redis hash task state machine (pending → running → completed/failed). Keys: `agent:state:{task_id}`, TTL: 1h.
3. **EventBus** (`backend/app/orchestrator/event_bus.py`) - Redis list pub/sub for SSE events. Keys: `sse:events:{session_id}`, max 100 events, TTL: 1h.
4. **Aggregator** (`backend/app/orchestrator/aggregator.py`) - Synchronous merger of sub-agent results into unified output with Chinese summary.

### SSE Event Types

| Event | When | Data |
|-------|------|------|
| `thinking` | Backend analyzing user input | `{message}` |
| `intent_parsed` | Intent extraction complete | `{destination, days, budget, people, origin, must_visit, summary}` |
| `dispatching` | Agents being dispatched | `{message, destination, days, budget, people}` |
| `agent_start` | Individual agent begins | `{message}` |
| `agent_progress` | Agent reports progress | `{message}` |
| `agent_complete` | Individual agent finishes | `{message, status}` |
| `aggregating` | Main agent combining results | `{message}` |
| `complete` | Final result ready (closes SSE) | `{response_text, trip_data, session_id}` |

### Agent System (`backend/app/agents/`)

All agents extend `BaseAgent` (ABC) with `name`, `llm` attributes and `async run(params, event_bus=None, session_id=None) -> dict`. Agents publish real-time events via `self._emit(event_bus, session_id, event_type, **kwargs)`.

| Agent | File | Purpose | External Data |
|-------|------|---------|---------------|
| ItineraryAgent | `itinerary.py` | Daily activity schedules | Amap POI search (attractions, restaurants, hotels) |
| BudgetAgent | `budget.py` | Cost breakdown by category | Pure LLM |
| TransportAgent | `transport.py` | Flight/rail/driving options | Amap geocode + route planning |
| WeatherAgent | `weather.py` | Multi-day forecasts | Amap weather API |

All agents parse JSON from LLM responses (handling markdown code blocks) and have fallback default data on parse failure.

### API Routes (`backend/app/api/`)

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/v1/chat` | Trigger: accepts message, starts background orchestration, returns `{session_id}` immediately |
| GET | `/api/v1/chat/{session_id}/stream` | SSE endpoint: delivers all events in real-time, auto-closes on `complete` |
| POST | `/api/v1/trips` | Create trip |
| GET | `/api/v1/trips` | List trips (paginated) |
| GET | `/api/v1/trips/{trip_id}` | Get trip detail |
| PUT | `/api/v1/trips/{trip_id}` | Update trip |
| GET | `/health` | Health check (returns `{"status": "ok"}`) |

### Frontend State Management

Three Zustand stores in `frontend/src/stores/`:
- **chatStore**: sessionId, messages[], isLoading
- **tripStore**: currentTrip, trips[]
- **agentStore**: events[], isRunning, overallProgress, phase, parsedIntent, agents[] (per-agent status)

### Frontend Data Flow (SSE-First)

`useChat` hook generates `session_id` → opens SSE via `createSSEConnection()` → sends POST (fire-and-forget) → SSE events feed into agentStore → AgentProgress component shows real-time thinking, intent badges, per-agent status grid → `complete` event adds final message to chatStore and closes SSE.

### MCP Integration

`backend/app/services/mcp_client.py` - `AmapMCPClient` connects to Amap MCP server via JSON-RPC 2.0 over HTTP. Used by ItineraryAgent, TransportAgent, WeatherAgent for real geocoding, POI search, routing, and weather data. Falls back to LLM-only data on API failure.

## Key Configuration

- `backend/app/core/config.py` - pydantic-settings with `@lru_cache` singleton. Reads from `.env`. Redis default includes password (`:123456@`).
- `backend/app/core/logging.py` - Provides `get_logger(name)` and async `log_timing(logger, step_name)` context manager used throughout backend. Suppresses noisy third-party loggers (httpx, pymongo, etc.).
- `.mcp.json` - MCP server config (Amap/高德地图) at project root.
- `frontend/vite.config.ts` - Dev proxy: `/api` → `http://localhost:8000`.

## Design System

Warm earth-tone palette with Chinese calligraphy fonts. CSS variables defined in `frontend/src/styles/global.css`. Components use inline `<style>` blocks (no CSS modules). Key colors: terracotta (#C67B5C), sage (#8B9D77), gold (#D4A574).

## Testing Patterns

- Backend tests use `mongomock-motor` for MongoDB and a `MockRedis` fixture for Redis.
- Agent tests mock the LLM with `unittest.mock.MagicMock` + `AsyncMock`.
- API tests use `httpx.AsyncClient` with `ASGITransport`.
- Frontend type checking via `npx tsc --noEmit` (strict mode enabled).
- Frontend has no test runner configured (no jest/vitest).
