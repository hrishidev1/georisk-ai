from http import HTTPStatus

from app.exceptions.base import AppException


class ProjectNotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND

    def __init__(self):
        super().__init__("Project not found.")