import json
from app.core.logging import get_logger

logger = get_logger("core.json_utils")


def extract_json_from_markdown(content: str) -> str:
    """Strip markdown code fences from LLM output, returning the inner content."""
    if "```json" in content:
        return content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        return content.split("```")[1].split("```")[0].strip()
    return content.strip()


def parse_llm_json(content: str) -> dict:
    """Parse JSON from LLM output, handling markdown code fences.

    Returns parsed dict on success, or {"summary": content[:500]} on failure.
    """
    try:
        cleaned = extract_json_from_markdown(content)
        result = json.loads(cleaned)
        logger.info("LLM JSON 解析成功")
        return result
    except json.JSONDecodeError:
        logger.warning(f"LLM JSON 解析失败 | content={content[:200]}")
        return {"summary": _sanitize_fallback(content)}

def _sanitize_fallback(content: str) -> str:
    """Return user-friendly text, filtering out LangGraph/internal error messages."""
    if not content:
        return "未能生成结果"
    lower = content.lower()
    if "need more steps" in lower or "recursion" in lower:
        return "正在为您整理数据，请稍后重试..."
    return content[:500]
