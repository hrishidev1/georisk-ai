from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import rasterio
from rasterio.mask import mask

from app.raster import extract_metadata
from app.raster.io import RasterIO
from app.raster.models import RasterMetadata
from app.processing.exceptions import ProcessorExecutionError


def create_clip(
    input_path: Path,
    output_path: Path,
    *,
    geometry: dict[str, Any],
) -> RasterMetadata:
    """
    Generate a clipped raster based on a geometry.

    Parameters
    ----------
    input_path:
        Input raster to clip.

    output_path:
        Destination clipped raster.

    geometry:
        GeoJSON Feature dict containing the geometry.

    Returns
    -------
    RasterMetadata
        Metadata of the generated clipped raster.
    """

    if "geometry" not in geometry:
        raise ProcessorExecutionError("Provided GeoJSON feature is missing 'geometry'.")

    geom = geometry["geometry"]

    with RasterIO.open(input_path) as src:
        try:
            out_image, out_transform = mask(
                src,
                [geom],
                crop=True,
                nodata=src.nodata,
            )
        except ValueError as e:
            if "overlap" in str(e).lower():
                raise ProcessorExecutionError("The clipping geometry is completely outside the raster extent.")
            raise ProcessorExecutionError(f"Failed to clip raster: {e}")
        except Exception as e:
            raise ProcessorExecutionError(f"Failed to clip raster due to invalid geometry or processing error: {e}")

        # ensure out_image does not contain NaN if dtype is integer.
        # rasterio handles nodata replacement in out_image.

        from app.raster.constants import DEFAULT_BLOCK_SIZE

        # Adjust block size if the clipped image is smaller than the block size
        blockxsize = min(DEFAULT_BLOCK_SIZE, out_image.shape[2])
        blockysize = min(DEFAULT_BLOCK_SIZE, out_image.shape[1])

        # Ensure block size is reasonable, some GDAL versions prefer multiples of 16
        # Or we can just omit tiled/blocksize if the image is too small
        kwargs = {
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
            "nodata": src.nodata,
            "compress": "lzw",
        }

        # Only tile if the output is large enough
        if out_image.shape[1] >= DEFAULT_BLOCK_SIZE and out_image.shape[2] >= DEFAULT_BLOCK_SIZE:
            kwargs.update({
                "tiled": True,
                "blockxsize": DEFAULT_BLOCK_SIZE,
                "blockysize": DEFAULT_BLOCK_SIZE,
            })

        profile = RasterIO.copy_profile(
            src,
            **kwargs,
        )

    # RasterIO.write is hardcoded to band 1, so we write directly to support multiband clips
    RasterIO.ensure_parent_directory(output_path)
    with rasterio.open(output_path, "w", **profile) as dst:
        dst.write(out_image)

    return extract_metadata(
        output_path,
    )
