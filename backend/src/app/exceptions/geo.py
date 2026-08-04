from http import HTTPStatus

from app.exceptions.base import AppException


class InvalidGeoJSONError(AppException):
    status_code = HTTPStatus.BAD_REQUEST
    detail = "Invalid GeoJSON."


class InvalidGeometryError(AppException):
    status_code = HTTPStatus.BAD_REQUEST
    detail = "Invalid geometry."