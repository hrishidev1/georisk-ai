"""
Data engineering ETL pipeline and export file abstractions.

Establishes standardized interface layers for converting operational PostGIS tables
and Rasterio spatial catalogs into lakehouse analytics formats (such as Apache Parquet)
for downstream BI tools and Looker Studio dashboards.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any


class DataPipeline(ABC):
    """
    Base contract for automated Data Engineering ETL synchronization jobs.
    """

    @abstractmethod
    def execute_extract(self, source_project_id: int) -> dict[str, Any]:
        """
        Extract relational boundaries and metadata for a target spatial workspace.
        """
        raise NotImplementedError

    @abstractmethod
    def execute_transform(self, raw_data: dict[str, Any]) -> dict[str, Any]:
        """
        Clean, project, and normalize raw geospatial structures for analytics ingestion.
        """
        raise NotImplementedError

    @abstractmethod
    def execute_load(self, transformed_data: dict[str, Any], output_path: Path) -> Path:
        """
        Load processed geospatial datasets into destination storage archives.
        """
        raise NotImplementedError


class MetadataExportService(ABC):
    """
    Contract for exporting database catalog metadata to cloud data catalog services.
    """

    @abstractmethod
    def export_project_catalog(
        self,
        project_id: int,
        destination: Path,
    ) -> Path:
        """
        Serialize all spatial layers, AOI schemas, and user permissions into standard JSON archives.
        """
        raise NotImplementedError


class ParquetExportService(ABC):
    """
    Contract for transforming vector geometries and raster summary feeds into columnar Apache Parquet format.
    """

    @abstractmethod
    def export_aois_to_parquet(
        self,
        project_id: int,
        destination_path: Path,
    ) -> Path:
        """
        Export PostGIS polygon area features into highly compressed columnar Parquet files for fast query reads.
        """
        raise NotImplementedError

    @abstractmethod
    def export_raster_metrics_to_parquet(
        self,
        project_id: int,
        destination_path: Path,
    ) -> Path:
        """
        Export statistical histogram pixel aggregates and spatial bounds into columnar analytics tables.
        """
        raise NotImplementedError
