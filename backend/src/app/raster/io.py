from pathlib import Path
from typing import Iterator

import rasterio
from rasterio import DatasetReader
from rasterio.errors import RasterioIOError

from app.raster.exceptions import CorruptedRasterError


class RasterIO:
    """
    Thin wrapper around Rasterio.

    Centralizes raster opening and exception translation while
    keeping the Rasterio API available to the rest of the package.
    """

    @staticmethod
    def open(
        path: Path,
    ) -> DatasetReader:
        """
        Open a raster dataset.

        Raises:
            CorruptedRasterError:
                If the raster cannot be opened.
        """

        try:
            return rasterio.open(path)
        except RasterioIOError as exc:
            raise CorruptedRasterError() from exc