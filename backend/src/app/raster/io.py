from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import rasterio
from rasterio.io import DatasetReader


class RasterIO:
    """
    Convenience wrapper around Rasterio operations.
    """

    @staticmethod
    def open(
        path: Path,
    ) -> DatasetReader:
        return rasterio.open(path)

    @staticmethod
    def copy_profile(
        dataset: DatasetReader,
        **updates: Any,
    ) -> dict[str, Any]:
        """
        Copy a dataset profile and apply updates.
        """
        profile = dataset.profile.copy()
        profile.update(**updates)
        return profile

    @staticmethod
    def ensure_parent_directory(
        path: Path,
    ) -> None:
        """
        Create the parent directory if it does not exist.
        """
        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

    @staticmethod
    def write(
        output_path: Path,
        data: np.ndarray,
        profile: dict[str, Any],
    ) -> None:
        """
        Write a raster to disk.
        """
        RasterIO.ensure_parent_directory(
            output_path,
        )

        import pprint
        print("==========================================")
        print("WRITING TIFF")
        print("==========================================")
        print(f"Output path:\n{output_path}")
        print(f"\nOutput file suffix:\n{output_path.suffix}")
        print(f"\nArray shape:\n{data.shape}")
        print(f"\nArray dtype:\n{data.dtype}")
        print("\n==========================================")
        print("PROFILE PASSED TO RASTERIO")
        print("==========================================")
        pprint.pprint(profile)
        print("==========================================")

        try:
            with rasterio.open(
                output_path,
                "w",
                **profile,
            ) as dst:
                dst.write(
                    data,
                    1,
                )
        except Exception:
            print("==========================================")
            print("FULL PROFILE ON EXCEPTION")
            print("==========================================")
            pprint.pprint(profile)
            print("==========================================")
            raise

    @staticmethod
    def resolution(
        dataset: DatasetReader,
    ) -> tuple[float, float]:
        """
        Return raster pixel resolution.
        """
        transform = dataset.transform

        return (
            abs(transform.a),
            abs(transform.e),
        )
    
    @staticmethod
    def read_band(
        dataset: DatasetReader,
        band: int = 1,
        *,
        masked: bool = True,
        dtype: np.dtype | None = None,
    ) -> np.ndarray:
        """
        Read a single band from a raster dataset.
        """
        data = dataset.read(
            band,
            masked=masked,
        )

        if dtype is not None:
            data = data.astype(dtype)

        return data

    @staticmethod
    def write_raster(
        output_path: Path,
        data: np.ndarray,
        profile: dict[str, Any],
    ) -> "RasterMetadata":
        from app.raster.metadata import extract_metadata
        from app.raster.models import RasterMetadata

        RasterIO.write(
            output_path,
            data,
            profile,
        )

        return extract_metadata(
            output_path,
        )