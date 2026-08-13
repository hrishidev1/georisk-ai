from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.crs import CRS
from rasterio.errors import CRSError

from app.raster import extract_metadata
from app.raster.io import RasterIO
from app.raster.models import RasterMetadata
from app.processing.exceptions import ProcessorExecutionError


def create_reproject(
    input_path: Path,
    output_path: Path,
    target_crs: str,
    resampling_method: str = "nearest",
) -> RasterMetadata:
    """
    Reproject a raster into a requested target CRS.

    Parameters
    ----------
    input_path:
        Input raster to reproject.

    output_path:
        Destination reprojected raster.

    target_crs:
        The EPSG code or PROJ string representing the target CRS.

    resampling_method:
        The resampling algorithm to use (e.g., 'nearest', 'bilinear', 'cubic').

    Returns
    -------
    RasterMetadata
        Metadata of the generated raster.
    """
    try:
        dst_crs = CRS.from_string(target_crs)
    except CRSError as e:
        raise ProcessorExecutionError(f"Invalid target CRS '{target_crs}': {e}")

    try:
        resampling_enum = getattr(Resampling, resampling_method.lower(), Resampling.nearest)
    except AttributeError:
        resampling_enum = Resampling.nearest

    with RasterIO.open(input_path) as src:
        src_crs = src.crs

        # If CRS already matches, just copy the file deterministically.
        if src_crs == dst_crs:
            RasterIO.ensure_parent_directory(output_path)
            shutil.copy2(input_path, output_path)
            return extract_metadata(output_path)

        try:
            transform, width, height = calculate_default_transform(
                src.crs,
                dst_crs,
                src.width,
                src.height,
                *src.bounds,
            )
        except Exception as e:
            raise ProcessorExecutionError(f"Failed to calculate default transform: {e}")

        from app.raster.constants import DEFAULT_BLOCK_SIZE

        kwargs = {
            "driver": "GTiff",
            "crs": dst_crs,
            "transform": transform,
            "width": width,
            "height": height,
            "compress": "lzw",
        }

        if width >= DEFAULT_BLOCK_SIZE and height >= DEFAULT_BLOCK_SIZE:
            kwargs.update(
                {
                    "tiled": True,
                    "blockxsize": DEFAULT_BLOCK_SIZE,
                    "blockysize": DEFAULT_BLOCK_SIZE,
                }
            )

        profile = RasterIO.copy_profile(src, **kwargs)

        RasterIO.ensure_parent_directory(output_path)

        with rasterio.open(output_path, "w", **profile) as dst:
            for i in range(1, src.count + 1):
                try:
                    reproject(
                        source=rasterio.band(src, i),
                        destination=rasterio.band(dst, i),
                        src_transform=src.transform,
                        src_crs=src.crs,
                        dst_transform=transform,
                        dst_crs=dst_crs,
                        resampling=resampling_enum,
                    )
                except Exception as e:
                    raise ProcessorExecutionError(f"Failed to reproject band {i}: {e}")

    return extract_metadata(
        output_path,
    )
