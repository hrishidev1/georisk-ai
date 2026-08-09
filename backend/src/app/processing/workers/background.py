from __future__ import annotations

from collections.abc import Callable
from typing import Any

from fastapi import BackgroundTasks

from app.processing.workers.base import ProcessingWorker


class BackgroundWorker(ProcessingWorker):
    """
    Worker implementation that executes processing jobs using
    FastAPI BackgroundTasks.
    """

    def __init__(
        self,
        background_tasks: BackgroundTasks,
    ) -> None:
        self._background_tasks = background_tasks

    def submit(
        self,
        job_id: int,
        target: Callable[..., None],
        *args: Any,
        **kwargs: Any,
    ) -> None:
        """
        Submit a processing job to FastAPI BackgroundTasks.

        Parameters
        ----------
        job_id:
            Reserved for future logging, tracing and queue backends.

        target:
            Function to execute.

        *args, **kwargs:
            Arguments forwarded to the target.
        """

        self._background_tasks.add_task(
            target,
            *args,
            **kwargs,
        )