import asyncio
import logging
from collections import defaultdict
from typing import Callable, Any
from .event_types import EventType, EngineEvent

logger = logging.getLogger(__name__)

class EventBus:
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = defaultdict(list)
        self._history: list[EngineEvent] = []
        self._max_history: int = 10000

    def subscribe(self, event_type: EventType | str, handler: Callable) -> None:
        type_str = event_type.value if isinstance(event_type, EventType) else event_type
        self._handlers[type_str].append(handler)

    def unsubscribe(self, event_type: EventType | str, handler: Callable) -> None:
        type_str = event_type.value if isinstance(event_type, EventType) else event_type
        if handler in self._handlers[type_str]:
            self._handlers[type_str].remove(handler)

    async def publish(self, event: EngineEvent) -> None:
        self._history.append(event)
        if len(self._history) > self._max_history:
            self._history.pop(0)

        type_str = event.type.value if isinstance(event.type, EventType) else event.type
        handlers = self._handlers.get(type_str, []) + self._handlers.get("*", [])
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    asyncio.create_task(handler(event))
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"Error executing handler {handler} for event {type_str}: {e}")

    def get_history(self, event_type: EventType | None = None, limit: int = 100) -> list[EngineEvent]:
        if event_type:
            events = [e for e in self._history if e.type == event_type]
        else:
            events = self._history
        return events[-limit:]

    def clear_history(self) -> None:
        self._history.clear()
