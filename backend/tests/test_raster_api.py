from unittest.mock import MagicMock
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.api.dependencies import get_current_user, get_raster_service
from app.models import User
from app.schemas.raster import RasterPointInspectionResponse


@pytest.fixture
def mock_user() -> User:
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "gis-user@example.com"
    return user


@pytest.fixture
def client(mock_user: User) -> TestClient:
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_raster_point_endpoint(client: TestClient, mock_user: User):
    mock_service = MagicMock()
    mock_service.inspect_point.return_value = RasterPointInspectionResponse(
        coordinates=[10.5, 45.5],
        values={"b1": 124.5},
        is_valid=True,
        crs="EPSG:4326",
        bounds=[10.0, 45.0, 11.0, 46.0],
        message="Valid point sample",
    )

    app.dependency_overrides[get_raster_service] = lambda: mock_service

    response = client.get("/api/v1/projects/1/rasters/42/point?lon=10.5&lat=45.5")
    assert response.status_code == 200
    data = response.json()
    assert data["coordinates"] == [10.5, 45.5]
    assert data["values"] == {"b1": 124.5}
    assert data["is_valid"] is True
    assert data["crs"] == "EPSG:4326"
    assert mock_service.inspect_point.called
