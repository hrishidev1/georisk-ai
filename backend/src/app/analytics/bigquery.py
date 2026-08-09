"""
Google Cloud BigQuery analytics sink placeholder implementation.

Establishes the streaming data warehouse contract for enterprise business intelligence,
enabling real-time query analysis over spatial telemetry without coupling backend code to BigQuery SDKs.
"""

from app.analytics.base import AnalyticsSink
from app.analytics.models import AnalyticsEvent


class BigQueryAnalyticsSink(AnalyticsSink):
    """
    Cloud analytical data sink backed by Google Cloud BigQuery streaming ingestion.

    Currently implemented as an architectural extension point. Future cloud production releases
    will bind to `google.cloud.bigquery.Client` for streaming insert pipelines.
    """

    def __init__(
        self,
        dataset_name: str,
        table_name: str = "spatial_events",
        project_id: str | None = None,
    ) -> None:
        self._dataset_name = dataset_name
        self._table_name = table_name
        self._project_id = project_id

    def record_event(
        self,
        event: AnalyticsEvent,
    ) -> None:
        raise NotImplementedError(
            f"BigQueryAnalyticsSink is an enterprise cloud extension point. "
            f"Unable to sink event type '{event.event_type}' into dataset '{self._dataset_name}' "
            f"in local runtime."
        )

    def flush(self) -> None:
        """
        No-op flush for BigQuery placeholder connections.
        """
        pass
