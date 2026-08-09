"""
No-Op Analytics Sink implementation for standalone developer execution.

Safely discards or passes through domain telemetry events without requiring local data
warehouse emulators or external cloud credentials.
"""

from app.analytics.base import AnalyticsSink
from app.analytics.models import AnalyticsEvent


class NoOpAnalyticsSink(AnalyticsSink):
    """
    Lightweight sink implementation used in local and automated testing environments.
    """

    def record_event(
        self,
        event: AnalyticsEvent,
    ) -> None:
        """
        Receive and discard analytics events silently during standalone developer execution.
        """
        pass

    def flush(self) -> None:
        """
        No-op flush operation for zero-dependency execution.
        """
        pass
