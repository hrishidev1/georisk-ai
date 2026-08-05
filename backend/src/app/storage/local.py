from pathlib import Path
import shutil
from typing import BinaryIO

from app.storage.base import StorageService
from app.storage.exceptions import (
    StorageDeleteError,
    StorageFileNotFoundError,
    StorageWriteError,
)


class LocalStorage(StorageService):
    def __init__(
        self,
        root: Path,
    ) -> None:
        self._root = root
        self._root.mkdir(
            parents=True,
            exist_ok=True,
        )

    def save(
        self,
        file: BinaryIO,
        destination: Path,
    ) -> Path:
        target = self._root / destination

        try:
            target.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            with target.open("wb") as output:
                shutil.copyfileobj(file, output)

            return target

        except OSError as exc:
            raise StorageWriteError(
                f"Failed to save file to '{target}'."
            ) from exc

    def delete(
        self,
        path: Path,
    ) -> None:
        target = self._root / path

        if not target.exists():
            raise StorageFileNotFoundError(
                f"File '{target}' does not exist."
            )

        try:
            target.unlink()

        except OSError as exc:
            raise StorageDeleteError(
                f"Failed to delete file '{target}'."
            ) from exc

    def exists(
        self,
        path: Path,
    ) -> bool:
        return (self._root / path).exists()

    def open(
        self,
        path: Path,
        mode: str = "rb",
    ) -> BinaryIO:
        target = self.resolve_path(path)

        return target.open(mode)

    def resolve_path(
        self,
        path: Path,
    ) -> Path:
        target = self._root / path

        if not target.exists():
            raise StorageFileNotFoundError(
                f"File '{target}' does not exist."
            )

        return target