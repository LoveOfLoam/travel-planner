import asyncio
import logging
from contextlib import asynccontextmanager


def get_logger(name: str) -> logging.Logger:
    """Get a named logger with consistent formatting"""
    return logging.getLogger(name)


@asynccontextmanager
async def log_timing(logger: logging.Logger, step_name: str, level=logging.INFO):
    """Async-safe timing context manager using event loop clock"""
    loop = asyncio.get_running_loop()
    start_time = loop.time()
    task_id = id(asyncio.current_task())
    logger.log(level, f"[START] {step_name} (task={task_id})")
    try:
        yield
        elapsed = loop.time() - start_time
        logger.log(level, f"[DONE]  {step_name} (task={task_id}) ({elapsed:.3f}s)")
    except Exception as e:
        elapsed = loop.time() - start_time
        logger.error(f"[FAIL]  {step_name} (task={task_id}) ({elapsed:.3f}s) - {e}", exc_info=True)
        raise


class AsyncLogHandler(logging.Handler):
    """Non-blocking log handler that uses an async queue"""

    def __init__(self, handler: logging.Handler, max_queue_size: int = 1000):
        super().__init__()
        self._handler = handler
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=max_queue_size)
        self._task: asyncio.Task | None = None

    def emit(self, record):
        try:
            self._queue.put_nowait(record)
        except asyncio.QueueFull:
            self._handler.emit(record)

    async def start(self):
        self._task = asyncio.current_task()
        while True:
            record = await self._queue.get()
            try:
                self._handler.emit(record)
            except Exception:
                pass
            finally:
                self._queue.task_done()


def setup_logging():
    """Configure root logger with consistent format"""
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    # Console handler
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)
    console.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-5s | %(name)-20s | %(message)s",
        datefmt="%H:%M:%S",
    ))
    root.addHandler(console)

    # Suppress noisy third-party loggers
    for name in [
        "httpcore", "httpx",
        "openai", "openai._base_client",
        "pymongo", "pymongo.topology", "pymongo.connection",
        "pymongo.command", "pymongo.serverSelection",
        "sse_starlette",
    ]:
        logging.getLogger(name).setLevel(logging.WARNING)
