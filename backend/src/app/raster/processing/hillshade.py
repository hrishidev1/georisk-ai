from __future__ import annotations

from pathlib import Path

import numpy as np
import rasterio

from app.raster import extract_metadata
from app.raster.io import RasterIO
from app.raster.models import RasterMetadata
from app.raster.terrain.analysis import calculate_gradients


def create_hillshade(
    input_path: Path,
    output_path: Path,
    *,
    azimuth: float = 315.0,
    altitude: float = 45.0,
    z_factor: float = 1.0,
) -> RasterMetadata:
    """
    Generate a hillshade raster from a DEM.

    Parameters
    ----------
    input_path:
        Input DEM raster.

    output_path:
        Destination hillshade raster.

    azimuth:
        Sun azimuth in degrees.

    altitude:
        Sun altitude in degrees.

    z_factor:
        Vertical exaggeration factor.

    Returns
    -------
    RasterMetadata
        Metadata of the generated hillshade raster.
    """

    with RasterIO.open(input_path) as src:
        dem = RasterIO.read_band(
            src,
            dtype=np.float32,
        )

        x_res, y_res = RasterIO.resolution(
            src,
        )

        dx, dy = calculate_gradients(
            dem,
            x_res,
            y_res,
            z_factor=z_factor,
        )

        slope = np.pi / 2.0 - np.arctan(
            np.sqrt(
                dx**2 + dy**2,
            ),
        )

        aspect = np.arctan2(
            -dx,
            dy,
        )

        azimuth_rad = np.deg2rad(
            azimuth,
        )

        altitude_rad = np.deg2rad(
            altitude,
        )

        hillshade = (
            np.sin(altitude_rad)
            * np.sin(slope)
            + np.cos(altitude_rad)
            * np.cos(slope)
            * np.cos(
                azimuth_rad - aspect,
            )
        )

        hillshade = np.clip(
            hillshade,
            0.0,
            1.0,
        )

        hillshade = (
            hillshade * 255
        ).astype(
            np.uint8,
        )

        from app.raster.constants import DEFAULT_BLOCK_SIZE

        profile = RasterIO.copy_profile(
            src,
            dtype=rasterio.uint8,
            count=1,
            compress="lzw",
            tiled=True,
            blockxsize=DEFAULT_BLOCK_SIZE,
            blockysize=DEFAULT_BLOCK_SIZE,
            nodata=0,
        )

    RasterIO.write(
        output_path=output_path,
        data=hillshade,
        profile=profile,
    )

    return extract_metadata(
        output_path,
    )