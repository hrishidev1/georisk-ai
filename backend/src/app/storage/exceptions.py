from app.exceptions.base import AppException


class StorageError(AppException):
    """Base exception for storage-related errors."""


class StorageFileNotFoundError(StorageError):
    """Raised when a requested file does not exist in storage."""


class StorageWriteError(StorageError):
    """Raised when a file cannot be written to storage."""


class StorageDeleteError(StorageError):
    """Raised when a file cannot be deleted from storage."""