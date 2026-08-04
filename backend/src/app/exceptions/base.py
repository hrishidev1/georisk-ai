from http import HTTPStatus


class AppException(Exception):
    """
    Base application exception.

    Every domain-specific exception inherits from this class.
    """

    status_code: HTTPStatus = HTTPStatus.INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None):
        if detail:
            self.detail = detail
        super().__init__(self.detail)