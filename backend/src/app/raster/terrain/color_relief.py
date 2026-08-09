from __future__ import annotations

import numpy as np


def normalize_elevation(
    elevation: np.ndarray,
    minimum: float | None = None,
    maximum: float | None = None,
) -> np.ndarray:
    """
    Normalize elevation values to the range [0, 1].

    Parameters
    ----------
    elevation:
        Elevation raster values.

    minimum:
        Optional minimum elevation. If omitted, the minimum
        finite value in the raster is used.

    maximum:
        Optional maximum elevation. If omitted, the maximum
        finite value in the raster is used.

    Returns
    -------
    np.ndarray
        Float32 normalized elevation values in [0, 1].
    """

    values = elevation.astype(
        np.float32,
        copy=False,
    )

    if minimum is None:
        minimum = float(
            np.nanmin(values),
        )

    if maximum is None:
        maximum = float(
            np.nanmax(values),
        )

    if maximum <= minimum:
        return np.zeros_like(
            values,
            dtype=np.float32,
        )

    normalized = (
        values - minimum
    ) / (
        maximum - minimum
    )

    return np.clip(
        normalized,
        0.0,
        1.0,
    ).astype(
        np.float32,
        copy=False,
    )


def elevation_to_rgb(
    normalized: np.ndarray,
) -> np.ndarray:
    """
    Convert normalized elevation values to RGB colors.

    The color ramp progresses from low elevation to high
    elevation using a terrain-style gradient.

    Parameters
    ----------
    normalized:
        Elevation values normalized to [0, 1].

    Returns
    -------
    np.ndarray
        RGB array with shape (3, height, width), dtype uint8.
    """

    values = np.clip(
        normalized,
        0.0,
        1.0,
    ).astype(
        np.float32,
        copy=False,
    )

    red = np.zeros_like(values)
    green = np.zeros_like(values)
    blue = np.zeros_like(values)

    # Low elevations: dark green -> green.
    low = values < 0.5

    low_position = values[low] * 2.0

    red[low] = 34.0 * low_position
    green[low] = 100.0 + (
        155.0 * low_position
    )
    blue[low] = 34.0 * (
        1.0 - low_position
    )

    # High elevations: green -> brown -> white.
    high_position = (
        values[~low] - 0.5
    ) * 2.0

    midpoint = high_position < 0.5

    high_red = np.empty_like(
        high_position,
    )
    high_green = np.empty_like(
        high_position,
    )
    high_blue = np.empty_like(
        high_position,
    )

    high_red[midpoint] = (
        34.0
        + 111.0 * (
            high_position[midpoint] * 2.0
        )
    )

    high_green[midpoint] = (
        255.0
        - 105.0 * (
            high_position[midpoint] * 2.0
        )
    )

    high_blue[midpoint] = (
        34.0
        - 34.0 * (
            high_position[midpoint] * 2.0
        )
    )

    high_red[~midpoint] = (
        145.0
        + 110.0 * (
            (high_position[~midpoint] - 0.5) * 2.0
        )
    )

    high_green[~midpoint] = (
        150.0
        + 105.0 * (
            (high_position[~midpoint] - 0.5) * 2.0
        )
    )

    high_blue[~midpoint] = (
        0.0
        + 255.0 * (
            (high_position[~midpoint] - 0.5) * 2.0
        )
    )

    red[~low] = high_red
    green[~low] = high_green
    blue[~low] = high_blue

    return np.stack(
        [
            np.clip(red, 0.0, 255.0),
            np.clip(green, 0.0, 255.0),
            np.clip(blue, 0.0, 255.0),
        ],
        axis=0,
    ).astype(
        np.uint8,
    )