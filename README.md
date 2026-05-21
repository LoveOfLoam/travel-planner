# 旅游规划大师 · Travel Planning Master

An AI-driven travel planning web application powered by multi-agent collaboration. Describe your trip in natural language, and intelligent agents work together to generate a complete travel plan — itinerary, budget, transport, and weather — with real-time progress streaming via SSE.

---

## Features

- **Natural Language Input** — Describe your trip freely (destination, dates, budget, must-visit spots) and the AI extracts structured travel parameters
- **Real-Time Agent Grid** — Watch as specialized agents (Itinerary, Transport, Weather) work in parallel, with live status updates via SSE
- **Complete Travel Plan** — Get a daily itinerary with activities, transport options, weather forecasts, and budget breakdown
- **Real Map Data** — Powered by Amap (高德地图) MCP server for POI search, geocoding, route planning, and weather
- **Warm Earth-Tone UI** — Inspired by traditional Chinese aesthetics with terracotta, sage, and gold accents

## Architecture

```
User Message (Chinese NL)
        │
        ▼
  ┌─────────────┐     ┌──────────────┐
  │  TaskRouter  │────▶│  TravelAgent │
  │ (intent parse)│     │ (LangGraph    │
  └─────────────┘     │  ReAct Agent) │
                      └──────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐   ┌─────────┐   ┌──────────┐
        │Itinerary│   │Transport│   │ Weather  │
        │  Agent  │   │  Agent  │   │  Agent   │
        └────┬────┘   └────┬────┘   └────┬─────┘
             │              │              │
        ┌────┴────┐    ┌────┴────┐    ┌───┴─────┐
        │POI Search│   │Route    │    │Weather  │
        │Geocoding │   │Planning │    │Forecast │
        └─────────┘    └─────────┘    └─────────┘
             │              │              │
             └──────────────┼──────────────┘
                            │
                    ┌───────▼───────┐
                    │  SSE EventBus │
                    │   (Redis)     │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │   Frontend    │
                    │  (React 18)   │
                    └───────────────┘
```

### Data Flow

1. **Frontend** generates a `session_id`, opens an SSE stream, then POSTs the user message
2. **TaskRouter** parses the message via LLM to extract intent, destination, days, budget, etc.
3. **TravelAgent** (LangGraph ReAct) autonomously calls Amap MCP tools to gather real data
4. All progress is streamed to the frontend in real-time via Redis-backed SSE events
5. The final travel plan JSON is rendered as cards: itinerary, weather, transport, budget, POIs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+, FastAPI, LangChain, LangGraph |
| **AI Model** | DeepSeek v4-pro (via LangChain ChatOpenAI) |
| **Frontend** | React 18, TypeScript 5, Vite 5, Zustand 4 |
| **Databases** | MongoDB (persistence), Redis (event bus + task state) |
| **External API** | Amap (高德地图) MCP Server — JSON-RPC 2.0 over HTTP |
| **Container** | Docker Compose (MongoDB, Redis, backend, frontend) |

## Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **MongoDB** 7+ and **Redis** 7+ (or use Docker)
- **API Keys**: DeepSeek API key + Amap (高德地图) API key

## Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/LoveOfLoam/travel-planner.git
cd travel-planner

# Copy and edit the environment file
cp .env.example .env
```

Edit `.env` with your API keys:

```env
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_API_BASE=https://api.deepseek.com
AMAP_API_KEY=your-amap-key
DEFAULT_MODEL=deepseek-v4-pro
```

Also update `.mcp.json` with your Amap key:

```json
{
  "mcpServers": {
    "amap": {
      "transport": "streamable_http",
      "url": "https://mcp.amap.com/mcp?key=YOUR_AMAP_KEY"
    }
  }
}
```

### 2. Docker (All Services)

```bash
docker-compose up
```

This starts MongoDB, Redis, backend (port 8000), and frontend (port 5173).

### 3. Manual Setup

**Backend:**

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/chat` | Send a travel request, returns `{session_id}` immediately |
| `GET` | `/api/v1/chat/{session_id}/stream` | SSE stream for real-time agent events |
| `POST` | `/api/v1/trips` | Create a trip |
| `GET` | `/api/v1/trips` | List trips (paginated) |
| `GET` | `/api/v1/trips/{trip_id}` | Get trip detail |
| `PUT` | `/api/v1/trips/{trip_id}` | Update trip |
| `GET` | `/health` | Health check |

### SSE Events

| Event | Description |
|-------|-------------|
| `thinking` | Backend is analyzing your request |
| `intent_parsed` | Destination, days, budget, etc. extracted |
| `dispatching` | Agents are being launched |
| `agent_start` | An agent begins its work |
| `agent_progress` | An agent reports progress |
| `agent_complete` | An agent finishes (status: `done` / `error`) |
| `complete` | Final result ready, SSE stream closes |

## Project Structure

```
travel-planner/
├── backend/
│   ├── app/
│   │   ├── agents/          # TravelAgent + tool wrappers
│   │   │   ├── travel_agent.py
│   │   │   └── tool_wrapper.py
│   │   ├── api/             # FastAPI routes
│   │   │   ├── chat.py      # Chat + SSE streaming
│   │   │   ├── trips.py     # Trip CRUD
│   │   │   └── deps.py      # Dependency injection
│   │   ├── core/            # Config, logging, utilities
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   ├── json_utils.py
│   │   │   ├── database.py
│   │   │   └── redis.py
│   │   ├── models/          # Pydantic models
│   │   ├── orchestrator/    # Task routing + state management
│   │   │   ├── task_router.py
│   │   │   ├── state_manager.py
│   │   │   └── event_bus.py
│   │   └── services/        # MCP manager + trip service
│   │       ├── mcp_manager.py
│   │       └── trip_service.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/      # React UI components
│       │   ├── Chat/        # ChatPanel, AgentProgress, MessageBubble
│       │   ├── Itinerary/   # DayPlan, ActivityItem, ItineraryCard
│       │   └── ResultPanel/ # WeatherCard, TransportCard, BudgetCard, POICard
│       ├── hooks/           # useChat, useSSE
│       ├── services/        # API + SSE client
│       ├── stores/          # Zustand: chatStore, tripStore, agentStore
│       ├── styles/          # Global CSS with CSS custom properties
│       └── types/           # TypeScript type definitions
├── .mcp.json                # MCP server configuration
├── docker-compose.yml
└── .env.example
```

## Configuration

All settings are defined in `backend/app/core/config.py` (pydantic-settings) and read from `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | DeepSeek API key |
| `OPENAI_API_BASE` | `https://api.deepseek.com` | API base URL |
| `DEFAULT_MODEL` | `deepseek-v4-pro` | Model name |
| `ANTHROPIC_API_KEY` | — | (Reserved) |
| `AMAP_API_KEY` | — | Amap (高德地图) API key |
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `LLM_REQUEST_TIMEOUT` | `60` | LLM request timeout (seconds) |
| `DEBUG` | `false` | Debug mode |

## Testing

```bash
cd backend
python -m pytest tests/ -v    # 30 tests
```

Tests use `mongomock-motor` (in-memory MongoDB) and `MockRedis` fixtures — no external services needed.

```bash
cd frontend
npx tsc --noEmit              # Type check
```

## Design

Warm earth-tone palette inspired by Chinese calligraphy and landscape painting:

| Color | Hex | Usage |
|-------|-----|-------|
| Terracotta | `#C67B5C` | Primary accents, buttons |
| Sage | `#8B9D77` | Success states, nature elements |
| Gold | `#D4A574` | Highlights, budget cards |

## License

MIT
