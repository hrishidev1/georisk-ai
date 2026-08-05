from pathlib import Path

from app.raster.io import RasterIO
from app.raster.models import RasterMetadata


def extract_metadata(
    path: Path,
) -> RasterMetadata:
    """
    Extract metadata from a raster dataset.

    Parameters
    ----------
    path:
        Path to the raster file.

    Returns
    -------
    RasterMetadata
        Metadata extracted from the raster.
    """

    with RasterIO.open(path) as dataset:
        bounds = dataset.bounds
        transform = dataset.transform

        return RasterMetadata(
            path=path,
            driver=dataset.driver,
            crs=dataset.crs.to_string() if dataset.crs else None,
            width=dataset.width,
            height=dataset.height,
            band_count=dataset.count,
            dtype=dataset.dtypes[0],
            nodata=dataset.nodata,
            pixel_size_x=transform.a,
            pixel_size_y=abs(transform.e),
            min_x=bounds.left,
            min_y=bounds.bottom,
            max_x=bounds.right,
            max_y=bounds.top,
            file_size=path.stat().st_size,
        )