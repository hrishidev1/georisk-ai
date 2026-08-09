"""
Google Cloud Pub/Sub messaging broker placeholder implementation.

Establishes the enterprise asynchronous queue contract for high-throughput distributed
GIS worker pools running on Google Cloud Platform (e.g., Cloud Run Workers or GKE pods).
"""

from typing import Any, Callable

from app.queue.base import QueueService


class PubSubQueue(QueueService):
    """
    Distributed cloud messaging queue backed by Google Cloud Pub/Sub.

    Currently structured as an architectural extension point. Future deployments will initialize
    `google.cloud.pubsub_v1` publisher and subscriber clients without altering backend domain code.
    """

    def __init__(
        self,
        project_id: str,
        topic_name: str,
        subscription_name: str | None = None,
    ) -> None:
        self._project_id = project_id
        self._topic_name = topic_name
        self._subscription_name = subscription_name

    def publish(
        self,
        topic: str,
        payload: dict[str, Any],
    ) -> str:
        raise NotImplementedError(
            f"PubSubQueue is an enterprise cloud extension point. "
            f"Unable to publish task payload to GCP topic '{topic}' in local execution runtime."
        )

    def subscribe(
        self,
        topic: str,
        handler: Callable[[dict[str, Any]], None],
    ) -> None:
        raise NotImplementedError(
            f"PubSubQueue subscription listening for topic '{topic}' requires live Google Cloud IAM permissions."
        )

    def close(self) -> None:
        """
        No-op close for placeholder Pub/Sub transport channels.
        """
        pass
