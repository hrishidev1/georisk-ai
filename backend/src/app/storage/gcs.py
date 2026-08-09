"""
Google Cloud Storage (GCS) backend placeholder implementation.

This class establishes the enterprise cloud storage contract for Google Cloud Platform.
In future production deployments, business domain services will interact with this class via
the `StorageService` interface without requiring direct knowledge of GCS bucket objects,
blob URIs, or authentication credentials.
"""

from pathlib import Path
from typing import BinaryIO

from app.storage.base import StorageService


class GoogleCloudStorage(StorageService):
    """
    Cloud storage implementation backed by Google Cloud Storage (GCS).

    Currently structured as a production-ready extension point. Future integrations
    will inject `google.cloud.storage.Client` to interact directly with object buckets.
    """

    def __init__(
        self,
        bucket_name: str,
        project_id: str | None = None,
    ) -> None:
        self._bucket_name = bucket_name
        self._project_id = project_id

    def save(
        self,
        file: BinaryIO,
        destination: Path,
    ) -> Path:
        """
        Upload a file stream directly to a target GCS bucket Blob.
        """
        raise NotImplementedError(
            f"GoogleCloudStorage is a reserved cloud extension point. "
            f"Unable to put object '{destination}' into GCS bucket '{self._bucket_name}' "
            f"in local execution mode."
        )

    def delete(
        self,
        path: Path,
    ) -> None:
        """
        Remove a stored blob from the GCS bucket.
        """
        raise NotImplementedError(
            f"GoogleCloudStorage delete operation for blob '{path}' is not implemented in local runtime."
        )

    def exists(
        self,
        path: Path,
    ) -> bool:
        """
        Query GCS metadata to verify object presence in the bucket.
        """
        raise NotImplementedError(
            f"GoogleCloudStorage exists verification for blob '{path}' requires live GCP credentials."
        )

    def open(
        self,
        path: Path,
        mode: str = "rb",
    ) -> BinaryIO:
        """
        Open a buffered streaming reader directly from GCS blob storage.
        """
        raise NotImplementedError(
            f"GoogleCloudStorage file streaming for blob '{path}' is not configured in local environment."
        )

    def resolve_path(
        self,
        path: Path,
    ) -> Path:
        """
        Object storage backends do not expose persistent POSIX filesystem paths.

        Any processing operation requiring local file disk handles must first stream
        or stage the object to a temporary scratch directory.
        """
        raise NotImplementedError(
            "GCS object blobs cannot be resolved directly to local POSIX filesystem paths."
        )

    def get_absolute_path(
        self,
        path: Path,
    ) -> Path:
        raise NotImplementedError(
            "GCS object blobs cannot be resolved directly to local POSIX filesystem paths."
        )
