from http import HTTPStatus

from app.exceptions.base import AppException


class AOINotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND
    detail = "AOI not found."