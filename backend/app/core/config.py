from pydantic_settings import BaseSettings
from functools import lru_cache
from langchain_openai import ChatOpenAI


class Settings(BaseSettings):
    # App
    app_name: str = "Travel Planner"
    debug: bool = False

    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "travel_planner"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # AI Models
    openai_api_key: str = ""
    openai_api_base: str = "https://api.deepseek.com"
    anthropic_api_key: str = ""
    default_model: str = "deepseek-v4-pro"

    # LLM
    llm_request_timeout: int = 60

    # Amap (高德地图)
    amap_api_key: str = ""

    # MCP Servers (JSON, overrides .mcp.json if set)
    mcp_servers_json: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def build_llm() -> ChatOpenAI:
    """Build a cached ChatOpenAI instance for connection pool reuse across requests."""
    settings = get_settings()
    return ChatOpenAI(
        model=settings.default_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_api_base,
        request_timeout=settings.llm_request_timeout,
        extra_body={"thinking": {"type": "disabled"}},
    )
