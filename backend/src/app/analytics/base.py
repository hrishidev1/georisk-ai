"""
Abstract Analytics Sink contract for event ingestion and data warehouse streaming.

Decodes operational telemetry from database transactional loops, enabling downstream Data Engineering
pipelines without impacting core spatial API responsiveness.
"""

from abc import ABC, abstractmethod

from app.analytics.models import AnalyticsEvent


class AnalyticsSink(ABC):
    """
    Interface for sinking domain events to data warehouses or logging backends.
    """

    @abstractmethod
    def record_event(
        self,
        event: AnalyticsEvent,
    ) -> None:
        """
        Ingest and buffer a structured domain analytics event.
        """
        raise NotImplementedError

    @abstractmethod
    def flush(self) -> None:
        """
        Force immediate transfer of buffered event pipelines to persistent storage.
        """
        raise NotImplementedError
