from http import HTTPStatus
from app.exceptions.base import AppException


class RasterNotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND

    def __init__(self) -> None:
        super().__init__("Raster not found.")


class RasterAlreadyExistsError(AppException):
    status_code = HTTPStatus.CONFLICT

    def __init__(self, name: str) -> None:
        super().__init__(f"Raster '{name}' already exists.")
