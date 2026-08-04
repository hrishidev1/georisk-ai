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
    def get_path(
        self,
        path: Path,
    ) -> Path:
        """
        Return a local path to the stored file.
        """
        raise NotImplementedError