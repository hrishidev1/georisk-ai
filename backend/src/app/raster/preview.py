from pathlib import Path
from typing import Dict, List, TypedDict

import numpy as np
from rio_tiler.io import Reader
from rio_tiler.models import ImageData

from app.raster.constants import DEFAULT_PREVIEW_SIZE
from app.raster.exceptions import CorruptedRasterError, RasterError


class BandStatistics(TypedDict):
    """
    Statistics and histogram data for a single raster band.
    """
    min: float
    max: float
    mean: float
    std: float
    valid_pixels: int
    histogram_counts: List[int]
    histogram_bins: List[float]


class RasterPreview:
    """
    Service for generating in-memory raster previews, thumbnails, and statistics.
    """

    @staticmethod
    def extract_statistics(path: Path) -> Dict[str, BandStatistics]:
        """
        Calculate raster band statistics and histogram information.

        Parameters
        ----------
        path : Path
            Path to the raster dataset.

        Returns
        -------
        Dict[str, BandStatistics]
            A mapping from band name (e.g., 'b1', 'b2') to its statistics.
        """
        try:
            with Reader(str(path)) as src:
                stats = src.statistics()

                result: Dict[str, BandStatistics] = {}
                for band_name, stat in stats.items():
                    hist_counts = [int(x) for x in stat.histogram[0]]
                    hist_bins = [float(x) for x in stat.histogram[1]]

                    result[band_name] = {
                        "min": float(stat.min),
                        "max": float(stat.max),
                        "mean": float(stat.mean),
                        "std": float(stat.std),
                        "valid_pixels": int(stat.valid_pixels),
                        "histogram_counts": hist_counts,
                        "histogram_bins": hist_bins,
                    }
                return result
        except Exception as e:
            if isinstance(e, RasterError):
                raise
            raise CorruptedRasterError(f"Failed to extract raster statistics: {e}") from e

    @staticmethod
    def generate_preview(path: Path, max_size: int = DEFAULT_PREVIEW_SIZE) -> bytes:
        """
        Generate a downsampled preview image in memory.

        Applies min/max rescaling based on dataset statistics if the data
        is not uint8 to produce a sensible grayscale or RGB preview.

        Parameters
        ----------
        path : Path
            Path to the raster dataset.
        max_size : int, optional
            Maximum dimension (width or height) of the preview image.

        Returns
        -------
        bytes
            The rendered PNG image data.
        """
        try:
            with Reader(str(path)) as src:
                img: ImageData = src.preview(max_size=max_size)

                if img.data.dtype != np.uint8:
                    stats = src.statistics()
                    band_keys = list(stats.keys())[:img.count]

                    in_range = []
                    for bk in band_keys:
                        b_min = float(stats[bk].min)
                        b_max = float(stats[bk].max)
                        if b_min == b_max:
                            b_max += 1.0  # Prevent division by zero during rescaling
                        in_range.append((b_min, b_max))

                    img = img.post_process(in_range=tuple(in_range))

                return img.render(img_format="PNG")
        except Exception as e:
            if isinstance(e, RasterError):
                raise
            raise CorruptedRasterError(f"Failed to generate raster preview: {e}") from e

    @staticmethod
    def generate_thumbnail(path: Path, max_size: int = 256) -> bytes:
        """
        Generate a smaller thumbnail image in memory.

        Parameters
        ----------
        path : Path
            Path to the raster dataset.
        max_size : int, optional
            Maximum dimension of the thumbnail image.

        Returns
        -------
        bytes
            The rendered PNG thumbnail data.
        """
        return RasterPreview.generate_preview(path, max_size=max_size)

    @staticmethod
    def inspect_point(path: Path, lon: float, lat: float) -> dict:
        """
        Sample raster pixel band values and metadata at a geographic coordinate (EPSG:4326).

        Parameters
        ----------
        path : Path
            Path to the raster dataset.
        lon : float
            Longitude in EPSG:4326.
        lat : float
            Latitude in EPSG:4326.

        Returns
        -------
        dict
            Dictionary containing coordinates, band values, validity, and CRS.
        """
        from rio_tiler.errors import PointOutsideBounds

        try:
            with Reader(str(path)) as src:
                bounds = src.get_geographic_bounds(src.crs)
                minx, miny, maxx, maxy = bounds
                in_bounds = (minx <= lon <= maxx) and (miny <= lat <= maxy)

                if not in_bounds:
                    return {
                        "coordinates": [lon, lat],
                        "values": {},
                        "is_valid": False,
                        "crs": str(src.crs),
                        "bounds": list(bounds),
                        "message": "Coordinates outside raster geographic bounds",
                    }

                try:
                    pt_data = src.point(lon, lat)
                    values = {}
                    band_names = pt_data.band_names or [f"band_{i+1}" for i in range(len(pt_data.data))]
                    for idx, name in enumerate(band_names):
                        val = float(pt_data.data[idx])
                        if np.isnan(val) or np.isinf(val):
                            values[name] = None
                        else:
                            values[name] = val

                    is_valid = any(v is not None for v in values.values())

                    return {
                        "coordinates": [lon, lat],
                        "values": values,
                        "is_valid": is_valid,
                        "crs": str(src.crs),
                        "bounds": list(bounds),
                        "message": "Valid point sample" if is_valid else "NoData at location",
                    }
                except PointOutsideBounds:
                    return {
                        "coordinates": [lon, lat],
                        "values": {},
                        "is_valid": False,
                        "crs": str(src.crs),
                        "bounds": list(bounds),
                        "message": "Point outside raster bounds",
                    }
        except Exception as e:
            if isinstance(e, RasterError):
                raise
            raise CorruptedRasterError(f"Failed to sample raster point: {e}") from e
