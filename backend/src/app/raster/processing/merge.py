from __future__ import annotations

from pathlib import Path

import rasterio
from rasterio.merge import merge

from app.raster import extract_metadata
from app.raster.io import RasterIO
from app.raster.models import RasterMetadata
from app.processing.exceptions import ProcessorExecutionError


def create_merge(
    input_paths: list[Path],
    output_path: Path,
) -> RasterMetadata:
    """
    Generate a merged raster from multiple input rasters.

    Parameters
    ----------
    input_paths:
        List of input rasters to merge. Must contain at least two.

    output_path:
        Destination merged raster.

    Returns
    -------
    RasterMetadata
        Metadata of the generated merged raster.
    """
    if len(input_paths) < 2:
        raise ProcessorExecutionError("Merge requires at least two input rasters.")

    datasets = []
    try:
        # Open all datasets
        for path in input_paths:
            datasets.append(RasterIO.open(path))

        # Validate CRS and band compatibility
        first_crs = datasets[0].crs
        first_dtype = datasets[0].dtypes[0]
        first_count = datasets[0].count
        first_nodata = datasets[0].nodata

        for i, src in enumerate(datasets[1:], 1):
            if src.crs != first_crs:
                raise ProcessorExecutionError(
                    f"CRS mismatch: Input 0 has {first_crs}, Input {i} has {src.crs}."
                )
            if src.dtypes[0] != first_dtype:
                raise ProcessorExecutionError(
                    f"Dtype mismatch: Input 0 has {first_dtype}, Input {i} has {src.dtypes[0]}."
                )
            if src.count != first_count:
                raise ProcessorExecutionError(
                    f"Band count mismatch: Input 0 has {first_count}, Input {i} has {src.count}."
                )

        out_image, out_transform = merge(datasets, nodata=first_nodata)

        from app.raster.constants import DEFAULT_BLOCK_SIZE

        kwargs = {
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
            "nodata": first_nodata,
            "compress": "lzw",
        }

        if out_image.shape[1] >= DEFAULT_BLOCK_SIZE and out_image.shape[2] >= DEFAULT_BLOCK_SIZE:
            kwargs.update(
                {
                    "tiled": True,
                    "blockxsize": DEFAULT_BLOCK_SIZE,
                    "blockysize": DEFAULT_BLOCK_SIZE,
                }
            )

        profile = RasterIO.copy_profile(
            datasets[0],
            **kwargs,
        )

        RasterIO.ensure_parent_directory(output_path)
        with rasterio.open(output_path, "w", **profile) as dst:
            dst.write(out_image)

    except ProcessorExecutionError:
        raise
    except Exception as e:
        raise ProcessorExecutionError(f"Failed to merge rasters: {e}")
    finally:
        for src in datasets:
            src.close()

    return extract_metadata(
        output_path,
    )
