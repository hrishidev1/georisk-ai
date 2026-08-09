"""
In-memory LocalQueue implementation for single-process asynchronous simulation.

Provides a thread-safe, non-external dependency messaging bus that allows the application
to run locally without external cloud message brokers or Redis instances.
"""

from collections import defaultdict, deque
from threading import Lock
from typing import Any, Callable
from uuid import uuid4

from app.queue.base import QueueService


class LocalQueue(QueueService):
    """
    Local in-memory message queue implementing the `QueueService` interface.

    When tasks are published, they are delivered immediately to registered subscribers
    in the current runtime process, or buffered in memory until a subscriber attaches.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._handlers: dict[str, list[Callable[[dict[str, Any]], None]]] = defaultdict(list)
        self._buffer: dict[str, deque[dict[str, Any]]] = defaultdict(deque)
        self._is_closed = False

    def publish(
        self,
        topic: str,
        payload: dict[str, Any],
    ) -> str:
        with self._lock:
            if self._is_closed:
                raise RuntimeError(f"Cannot publish to closed LocalQueue topic '{topic}'.")

            task_id = str(uuid4())
            message = {"_task_id": task_id, **payload}

            handlers = self._handlers.get(topic, [])
            if handlers:
                # Deliver directly to registered consumer handlers
                for handler in handlers:
                    handler(message)
            else:
                # Buffer in queue until a worker subscribes
                self._buffer[topic].append(message)

            return task_id

    def subscribe(
        self,
        topic: str,
        handler: Callable[[dict[str, Any]], None],
    ) -> None:
        with self._lock:
            if self._is_closed:
                return

            self._handlers[topic].append(handler)
            # Flush existing buffered payloads to newly attached handler
            while self._buffer[topic]:
                msg = self._buffer[topic].popleft()
                handler(msg)

    def close(self) -> None:
        with self._lock:
            self._is_closed = True
            self._handlers.clear()
            self._buffer.clear()
