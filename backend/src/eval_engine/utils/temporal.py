from collections import deque
from typing import Generic, TypeVar

T = TypeVar("T")

class SlidingWindow(Generic[T]):
    """Sliding window for temporal data analysis."""
    def __init__(self, max_duration: float, max_items: int = 1000):
        self._items: deque[tuple[float, T]] = deque()
        self._max_duration = max_duration
        self._max_items = max_items
    
    def add(self, timestamp: float, item: T) -> None:
        """Add an item with its timestamp."""
        self._items.append((timestamp, item))
        self._prune(timestamp)

    def _prune(self, current_time: float) -> None:
        """Remove items older than max_duration."""
        while self._items and (current_time - self._items[0][0] > self._max_duration or len(self._items) > self._max_items):
            self._items.popleft()

    def get_items(self, duration: float | None = None) -> list[tuple[float, T]]:
        """Get items within the given duration."""
        if duration is None:
            return list(self._items)
        if not self._items:
            return []
        current_time = self._items[-1][0]
        return [(t, i) for t, i in self._items if current_time - t <= duration]

    def get_values(self, duration: float | None = None) -> list[T]:
        """Get only the values of the items."""
        return [item[1] for item in self.get_items(duration)]

    @property
    def count(self) -> int:
        """Number of items in the window."""
        return len(self._items)

    @property
    def duration(self) -> float:
        """Duration span of the current window."""
        if not self._items:
            return 0.0
        return self._items[-1][0] - self._items[0][0]

    def clear(self) -> None:
        """Clear all items."""
        self._items.clear()
