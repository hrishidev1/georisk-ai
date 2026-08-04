from http import HTTPStatus

from app.exceptions.base import AppException


class UserAlreadyExistsError(AppException):
    status_code = HTTPStatus.CONFLICT

    def __init__(self, email: str):
        super().__init__(
            detail=f"User with email '{email}' already exists."
        )


class UserNotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND

    def __init__(self):
        super().__init__("User not found.")