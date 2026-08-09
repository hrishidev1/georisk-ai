from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any


class ProcessingWorker(ABC):
    """
    Abstract worker responsible for scheduling processing jobs.
    """

    @abstractmethod
    def submit(
        self,
        job_id: int,
        target: Callable[..., None],
        *args: Any,
        **kwargs: Any,
    ) -> None:
        """
        Schedule a processing task for execution.
        """
        raise NotImplementedError