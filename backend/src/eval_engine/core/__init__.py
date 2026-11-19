from abc import ABC, abstractmethod
from typing import Any
from ..events.event_bus import EventBus
from ..config import Settings

class BaseEngine(ABC):
    """Abstract base class for all engine components."""
    def __init__(self, event_bus: EventBus | None = None, config: Settings | None = None):
        self.event_bus = event_bus or EventBus()
        self.config = config or Settings()
        self._initialized = False

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize resources required by the engine."""
        pass

    @abstractmethod
    async def process(self, data: Any) -> Any:
        """Process incoming data."""
        pass

    @abstractmethod
    async def shutdown(self) -> None:
        """Release resources before shutdown."""
        pass

    @property
    def is_initialized(self) -> bool:
        """Check if engine is successfully initialized."""
        return self._initialized
