from __future__ import annotations

import numpy as np


def calculate_gradients(
    dem: np.ndarray,
    x_resolution: float,
    y_resolution: float,
    *,
    z_factor: float = 1.0,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Calculate terrain gradients in the X and Y directions.

    Parameters
    ----------
    dem:
        Input DEM as a NumPy array.

    x_resolution:
        Pixel size in the X direction.

    y_resolution:
        Pixel size in the Y direction.

    z_factor:
        Vertical exaggeration factor.

    Returns
    -------
    tuple[np.ndarray, np.ndarray]
        Terrain gradients (dx, dy).
    """

    scaled_dem = dem.astype(
        np.float32,
        copy=False,
    ) * z_factor

    dy, dx = np.gradient(
        scaled_dem,
        y_resolution,
        x_resolution,
    )

    return dx, dy


def calculate_slope(
    dx: np.ndarray,
    dy: np.ndarray,
) -> np.ndarray:
    """
    Calculate terrain slope in degrees from terrain gradients.

    Parameters
    ----------
    dx:
        Gradient in the X direction.

    dy:
        Gradient in the Y direction.

    Returns
    -------
    np.ndarray
        Slope values in degrees.
    """

    slope_radians = np.arctan(
        np.sqrt(
            dx**2 + dy**2,
        ),
    )

    return np.degrees(
        slope_radians,
    ).astype(
        np.float32,
        copy=False,
    )


def calculate_aspect(
    dx: np.ndarray,
    dy: np.ndarray,
) -> np.ndarray:
    """
    Calculate terrain aspect in degrees.

    Aspect represents the compass direction toward which
    the terrain is facing.

    Parameters
    ----------
    dx:
        Gradient in the X direction.

    dy:
        Gradient in the Y direction.

    Returns
    -------
    np.ndarray
        Aspect values in degrees from 0 to 360.
    """

    aspect = np.degrees(
        np.arctan2(
            -dx,
            dy,
        ),
    )

    aspect = np.mod(
        aspect,
        360.0,
    )

    return aspect.astype(
        np.float32,
        copy=False,
    )