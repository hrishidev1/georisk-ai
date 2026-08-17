import numpy as np
import pytest
import rasterio
from rasterio.transform import from_bounds
from pathlib import Path

from app.raster.preview import RasterPreview
from app.schemas.raster import RasterPointInspectionResponse


@pytest.fixture
def sample_geotiff(tmp_path: Path) -> Path:
    """Create a temporary 10x10 single-band GeoTIFF with known values."""
    file_path = tmp_path / "sample.tif"
    width, height = 10, 10
    # Bounds: lon [10.0, 11.0], lat [45.0, 46.0]
    transform = from_bounds(10.0, 45.0, 11.0, 46.0, width, height)
    data = np.arange(100, dtype=np.float32).reshape((1, height, width))

    with rasterio.open(
        file_path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=1,
        dtype=np.float32,
        crs="EPSG:4326",
        transform=transform,
        nodata=-9999.0,
    ) as dst:
        dst.write(data)

    return file_path


def test_raster_preview_generate_preview(sample_geotiff: Path):
    preview_bytes = RasterPreview.generate_preview(sample_geotiff, max_size=64)
    assert isinstance(preview_bytes, bytes)
    assert len(preview_bytes) > 0
    # PNG signature
    assert preview_bytes.startswith(b"\x89PNG")


def test_raster_preview_generate_thumbnail(sample_geotiff: Path):
    thumb_bytes = RasterPreview.generate_thumbnail(sample_geotiff, max_size=32)
    assert isinstance(thumb_bytes, bytes)
    assert len(thumb_bytes) > 0
    assert thumb_bytes.startswith(b"\x89PNG")


def test_raster_preview_extract_statistics(sample_geotiff: Path):
    stats = RasterPreview.extract_statistics(sample_geotiff)
    assert isinstance(stats, dict)
    assert len(stats) > 0

    first_band = next(iter(stats.values()))
    assert first_band["min"] == 0.0
    assert first_band["max"] == 99.0
    assert first_band["valid_pixels"] == 100
    assert len(first_band["histogram_counts"]) > 0


def test_raster_preview_inspect_point_inside_bounds(sample_geotiff: Path):
    # Sample center of raster: lon 10.5, lat 45.5
    result = RasterPreview.inspect_point(sample_geotiff, lon=10.5, lat=45.5)

    assert result["is_valid"] is True
    assert result["coordinates"] == [10.5, 45.5]
    assert len(result["values"]) > 0
    assert next(iter(result["values"].values())) is not None

    # Validate against Pydantic schema
    response_model = RasterPointInspectionResponse(**result)
    assert response_model.is_valid is True


def test_raster_preview_inspect_point_outside_bounds(sample_geotiff: Path):
    # Sample point far outside raster: lon 0.0, lat 0.0
    result = RasterPreview.inspect_point(sample_geotiff, lon=0.0, lat=0.0)

    assert result["is_valid"] is False
    assert result["values"] == {}
    assert "outside" in result["message"].lower()

    # Validate against Pydantic schema
    response_model = RasterPointInspectionResponse(**result)
    assert response_model.is_valid is False
