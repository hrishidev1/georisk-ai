import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadRaster, listRasters, getRaster, deleteRaster, getRasterPreview, getRasterStatistics } from "@/api/rasters";
import type { RasterCreate } from "@/types/raster";

export const rasterKeys = {
  all: (projectId: number) => ["projects", projectId, "rasters"] as const,
  detail: (projectId: number, rasterId: number) =>
    ["projects", projectId, "rasters", rasterId] as const,
  preview: (projectId: number, rasterId: number) =>
    ["projects", projectId, "rasters", rasterId, "preview"] as const,
  statistics: (projectId: number, rasterId: number) =>
    ["projects", projectId, "rasters", rasterId, "statistics"] as const,
};

export function useRasters(projectId: number) {
  return useQuery({
    queryKey: rasterKeys.all(projectId),
    queryFn: () => listRasters(projectId),
    enabled: !!projectId,
  });
}

export function useRaster(projectId: number, rasterId: number) {
  return useQuery({
    queryKey: rasterKeys.detail(projectId, rasterId),
    queryFn: () => getRaster(projectId, rasterId),
    enabled: !!projectId && !!rasterId,
  });
}

export function useRasterPreview(projectId: number, rasterId: number) {
  return useQuery({
    queryKey: rasterKeys.preview(projectId, rasterId),
    queryFn: async () => {
      const blob = await getRasterPreview(projectId, rasterId);
      return URL.createObjectURL(blob);
    },
    enabled: !!projectId && !!rasterId,
  });
}

export function useRasterStatistics(projectId: number, rasterId: number) {
  return useQuery({
    queryKey: rasterKeys.statistics(projectId, rasterId),
    queryFn: () => getRasterStatistics(projectId, rasterId),
    enabled: !!projectId && !!rasterId,
  });
}

export function useUploadRaster(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, file }: { data: RasterCreate; file: File }) =>
      uploadRaster(projectId, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rasterKeys.all(projectId) });
    },
  });
}

export function useDeleteRaster(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rasterId: number) => deleteRaster(projectId, rasterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rasterKeys.all(projectId) });
    },
  });
}
