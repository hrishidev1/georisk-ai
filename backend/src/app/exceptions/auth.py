from http import HTTPStatus

from app.exceptions.base import AppException


class InvalidCredentialsError(AppException):
    status_code = HTTPStatus.UNAUTHORIZED

    def __init__(self):
        super().__init__("Invalid email or password.")


class InvalidTokenError(AppException):
    status_code = HTTPStatus.UNAUTHORIZED

    def __init__(self):
        super().__init__("Invalid authentication token.")


class ExpiredTokenError(AppException):
    status_code = HTTPStatus.UNAUTHORIZED

    def __init__(self):
        super().__init__("Authentication token has expired.")