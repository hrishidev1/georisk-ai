from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO


class StorageService(ABC):
    @abstractmethod
    def save(
        self,
        file: BinaryIO,
        destination: Path,
    ) -> Path:
        """
        Store a file-like object and return its storage path.
        """
        raise NotImplementedError

    @abstractmethod
    def delete(
        self,
        path: Path,
    ) -> None:
        """
        Delete a stored file.
        """
        raise NotImplementedError

    @abstractmethod
    def exists(
        self,
        path: Path,
    ) -> bool:
        """
        Check whether a stored file exists.
        """
        raise NotImplementedError

    @abstractmethod
    def open(
        self,
        path: Path,
        mode: str = "rb",
    ) -> BinaryIO:
        """
        Open a stored file.
        """
        raise NotImplementedError

    @abstractmethod
    def resolve_path(
        self,
        path: Path,
    ) -> Path:
        """
        Return a local filesystem path for an existing file.

        Storage backends that do not expose local paths
        should raise NotImplementedError.
        """
        raise NotImplementedError

    @abstractmethod
    def get_absolute_path(
        self,
        path: Path,
    ) -> Path:
        """
        Return the absolute filesystem path for a relative storage path.

        Unlike ``resolve_path``, this does NOT verify that the file exists,
        making it suitable for output paths that have not been written yet.
        """
        raise NotImplementedError