from http import HTTPStatus

from app.exceptions.base import AppException


class ProcessingJobNotFoundError(AppException):
    status_code = HTTPStatus.NOT_FOUND
    detail = "Processing job not found."

class ProcessingJobStateError(AppException):
    status_code = HTTPStatus.CONFLICT
    detail = "Processing job cannot be cancelled in its current state."