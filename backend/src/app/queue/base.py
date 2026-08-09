"""
Abstract Queue Service contract for asynchronous job distribution and task dispatching.

Enables decoupling of heavy geospatial processing algorithms (such as Rasterio ETL jobs
and hazard prediction simulation) from synchronous HTTP API request loops.
"""

from abc import ABC, abstractmethod
from typing import Any, Callable


class QueueService(ABC):
    """
    Interface for messaging and background task queuing infrastructure.
    """

    @abstractmethod
    def publish(
        self,
        topic: str,
        payload: dict[str, Any],
    ) -> str:
        """
        Publish a structured task payload to the specified messaging topic or channel.

        Parameters
        ----------
        topic : str
            Name of the destination topic or task queue.
        payload : dict[str, Any]
            JSON-serializable data dictionary representing the task parameters.

        Returns
        -------
        str
            A unique tracking task or message identifier.
        """
        raise NotImplementedError

    @abstractmethod
    def subscribe(
        self,
        topic: str,
        handler: Callable[[dict[str, Any]], None],
    ) -> None:
        """
        Register a callback handler to receive messages from a designated topic.

        Parameters
        ----------
        topic : str
            Name of the target messaging topic or channel.
        handler : Callable[[dict[str, Any]], None]
            Callback function that consumes and executes task payloads.
        """
        raise NotImplementedError

    @abstractmethod
    def close(self) -> None:
        """
        Cleanly terminate open network sockets, worker channels, or connection pools.
        """
        raise NotImplementedError
