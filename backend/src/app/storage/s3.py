"""
Amazon S3 (Simple Storage Service) cloud backend placeholder implementation.

Ensures interoperability and multi-cloud architectural compliance by implementing
the unified `StorageService` contract for S3-compatible object storage backends.
"""

from pathlib import Path
from typing import BinaryIO

from app.storage.base import StorageService


class S3Storage(StorageService):
    """
    Cloud storage implementation backed by AWS S3 or S3-compatible endpoints.

    In future cloud deployments, this class will manage `boto3` interactions and S3 Bucket objects
    while shielding application services from SDK dependencies.
    """

    def __init__(
        self,
        bucket_name: str,
    ) -> None:
        self._bucket_name = bucket_name

    def save(
        self,
        file: BinaryIO,
        destination: Path,
    ) -> Path:
        raise NotImplementedError(
            f"S3Storage is a reserved cloud extension point. "
            f"Unable to put object '{destination}' into S3 bucket '{self._bucket_name}'."
        )

    def delete(
        self,
        path: Path,
    ) -> None:
        raise NotImplementedError(
            f"S3Storage delete operation for object '{path}' is not implemented in local runtime."
        )

    def exists(
        self,
        path: Path,
    ) -> bool:
        raise NotImplementedError(
            f"S3Storage existence checks for object '{path}' require live AWS credentials."
        )

    def open(
        self,
        path: Path,
        mode: str = "rb",
    ) -> BinaryIO:
        raise NotImplementedError(
            f"S3Storage file streaming for object '{path}' is not available locally."
        )

    def resolve_path(
        self,
        path: Path,
    ) -> Path:
        raise NotImplementedError(
            "S3 object blobs cannot be resolved directly to local POSIX filesystem paths."
        )

    def get_absolute_path(
        self,
        path: Path,
    ) -> Path:
        raise NotImplementedError(
            "S3 object blobs cannot be resolved directly to local POSIX filesystem paths."
        )
