from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_db, close_db
from app.core.redis import connect_redis, close_redis
from app.core.logging import setup_logging, get_logger
from app.services.mcp_manager import MCPManager
from app.api.chat import router as chat_router
from app.api.trips import router as trips_router

setup_logging()
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    await connect_redis()

    mcp_manager = MCPManager()
    await mcp_manager.initialize()
    app.state.mcp_manager = mcp_manager

    yield

    # Shutdown
    await mcp_manager.close()
    await close_redis()
    await close_db()


app = FastAPI(
    title="Travel Planner API",
    description="旅游规划大师 API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(trips_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
