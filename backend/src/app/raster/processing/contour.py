from __future__ import annotations

import ctypes
import ctypes.util
from pathlib import Path

import rasterio


class _GDALContourGenerator:
    """
    Thin ctypes wrapper around GDALContourGenerate.

    Uses the GDAL shared library bundled with Rasterio so the project
    does not introduce a second GDAL installation or version.
    """

    def __init__(self) -> None:
        rasterio_path = Path(
            rasterio.__file__,
        ).resolve()

        libraries_directory = (
            rasterio_path.parent.parent
            / "rasterio.libs"
        )

        libraries = sorted(
            libraries_directory.glob(
                "*gdal*.so*",
            ),
        )

        if not libraries:
            raise RuntimeError(
                "Could not locate the GDAL library bundled with Rasterio.",
            )

        self._library = ctypes.CDLL(
            str(libraries[0]),
        )

        self._configure()

    def _configure(self) -> None:
        self._library.GDALAllRegister.argtypes = []
        self._library.GDALAllRegister.restype = None

        self._library.GDALOpen.argtypes = [
            ctypes.c_char_p,
            ctypes.c_int,
        ]
        self._library.GDALOpen.restype = ctypes.c_void_p

        self._library.GDALClose.argtypes = [
            ctypes.c_void_p,
        ]
        self._library.GDALClose.restype = None

        self._library.GDALGetRasterBand.argtypes = [
            ctypes.c_void_p,
            ctypes.c_int,
        ]
        self._library.GDALGetRasterBand.restype = ctypes.c_void_p

        self._library.GDALContourGenerate.argtypes = [
            ctypes.c_void_p,
            ctypes.c_double,
            ctypes.c_double,
            ctypes.c_int,
            ctypes.POINTER(ctypes.c_double),
            ctypes.c_int,
            ctypes.c_double,
            ctypes.c_void_p,
            ctypes.c_int,
            ctypes.c_int,
            ctypes.c_void_p,
            ctypes.c_void_p,
        ]
        self._library.GDALContourGenerate.restype = ctypes.c_int

        self._library.OGRGetDriverByName.argtypes = [
            ctypes.c_char_p,
        ]
        self._library.OGRGetDriverByName.restype = ctypes.c_void_p

        self._library.OGR_Dr_CreateDataSource.argtypes = [
            ctypes.c_void_p,
            ctypes.c_char_p,
            ctypes.c_void_p,
        ]
        self._library.OGR_Dr_CreateDataSource.restype = ctypes.c_void_p

        self._library.OGR_DS_CreateLayer.argtypes = [
            ctypes.c_void_p,
            ctypes.c_char_p,
            ctypes.c_void_p,
            ctypes.c_int,
            ctypes.c_void_p,
        ]
        self._library.OGR_DS_CreateLayer.restype = ctypes.c_void_p

        self._library.OGR_L_CreateField.argtypes = [
            ctypes.c_void_p,
            ctypes.c_void_p,
            ctypes.c_int,
        ]
        self._library.OGR_L_CreateField.restype = ctypes.c_int

        self._library.OGR_Fld_Create.argtypes = [
            ctypes.c_char_p,
            ctypes.c_int,
        ]
        self._library.OGR_Fld_Create.restype = ctypes.c_void_p

        self._library.OSRNewSpatialReference.argtypes = [
            ctypes.c_char_p,
        ]
        self._library.OSRNewSpatialReference.restype = ctypes.c_void_p

        self._library.OSRImportFromWkt.argtypes = [
            ctypes.POINTER(ctypes.c_void_p),
            ctypes.c_char_p,
        ]
        self._library.OSRImportFromWkt.restype = ctypes.c_int

        self._library.OSRDestroySpatialReference.argtypes = [
            ctypes.c_void_p,
        ]
        self._library.OSRDestroySpatialReference.restype = None

        self._library.OGR_DS_Destroy.argtypes = [
            ctypes.c_void_p,
        ]
        self._library.OGR_DS_Destroy.restype = None

    def generate(
        self,
        *,
        input_path: Path,
        output_path: Path,
        interval: float,
        nodata: float | None = None,
    ) -> int:
        self._library.GDALAllRegister()

        dataset = self._library.GDALOpen(
            str(input_path).encode(),
            0,
        )

        if not dataset:
            raise RuntimeError(
                f"GDAL could not open '{input_path}'.",
            )

        try:
            band = self._library.GDALGetRasterBand(
                dataset,
                1,
            )

            if not band:
                raise RuntimeError(
                    "GDAL could not access the first raster band.",
                )

            driver = self._library.OGRGetDriverByName(
                b"GPKG",
            )

            if not driver:
                raise RuntimeError(
                    "GDAL GeoPackage driver is unavailable.",
                )

            output_dataset = (
                self._library.OGR_Dr_CreateDataSource(
                    driver,
                    str(output_path).encode(),
                    None,
                )
            )

            if not output_dataset:
                raise RuntimeError(
                    f"Could not create '{output_path}'.",
                )

            try:
                layer = self._library.OGR_DS_CreateLayer(
                    output_dataset,
                    b"contours",
                    None,
                    2,
                    None,
                )

                if not layer:
                    raise RuntimeError(
                        "Could not create contour layer.",
                    )

                field = self._library.OGR_Fld_Create(
                    b"elevation",
                    2,
                )

                if not field:
                    raise RuntimeError(
                        "Could not create elevation field.",
                    )

                result = self._library.OGR_L_CreateField(
                    layer,
                    field,
                    1,
                )

                if result != 0:
                    raise RuntimeError(
                        "Could not create elevation field.",
                    )

                result = self._library.GDALContourGenerate(
                    band,
                    float(interval),
                    0.0,
                    0,
                    None,
                    1 if nodata is not None else 0,
                    float(nodata) if nodata is not None else -9999.0,
                    layer,
                    -1,
                    0,
                    None,
                    None,
                )

                if result != 0:
                    raise RuntimeError(
                        "GDAL contour generation failed.",
                    )

                return result

            finally:
                self._library.OGR_DS_Destroy(
                    output_dataset,
                )

        finally:
            self._library.GDALClose(
                dataset,
            )


def create_contours(
    *,
    input_path: Path,
    output_path: Path,
    interval: float,
) -> dict[str, object]:
    """
    Generate contour lines from a DEM using GDAL.

    The generated contours are written to a GeoPackage.
    """

    if interval <= 0:
        raise ValueError(
            "Contour interval must be greater than zero.",
        )

    input_path = Path(input_path)
    output_path = Path(output_path)

    if not input_path.exists():
        raise FileNotFoundError(
            f"Input raster does not exist: '{input_path}'.",
        )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.unlink(
        missing_ok=True,
    )

    with rasterio.open(input_path) as source:
        if source.count < 1:
            raise ValueError(
                "Input raster does not contain any bands.",
            )

        if source.crs is None:
            raise ValueError(
                "Input raster must have a CRS.",
            )

        elevation = source.read(
            1,
            masked=True,
        )

        if elevation.count == 0:
            raise ValueError(
                "DEM contains no valid elevation data.",
            )

        minimum = float(
            elevation.min(),
        )

        maximum = float(
            elevation.max(),
        )

        if minimum == maximum:
            raise ValueError(
                "DEM contains no elevation range for "
                "contour generation.",
            )

        nodata = source.nodata

        if nodata is None:
            nodata = -9999.0

        transform = source.transform
        crs = source.crs

    generator = _GDALContourGenerator()

    generator.generate(
        input_path=input_path,
        output_path=output_path,
        interval=interval,
        nodata=nodata,
    )

    if not output_path.exists():
        raise RuntimeError(
            "GDAL reported successful contour generation, "
            "but no output file was created.",
        )

    return {
        "feature_count": None,
        "min_elevation": minimum,
        "max_elevation": maximum,
        "interval": float(interval),
        "crs": crs.to_string(),
        "nodata": nodata,
        "transform": transform,
    }