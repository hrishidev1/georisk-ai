import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listAOIs,
  getAOI,
  createAOI,
  updateAOI,
  deleteAOI,
} from "@/api/aois";
import type { AOICreate, AOIUpdate } from "@/types/aoi";

export const aoiKeys = {
  all: (projectId: number) => ["projects", projectId, "aois"] as const,
  detail: (projectId: number, aoiId: number) =>
    ["projects", projectId, "aois", aoiId] as const,
};

export function useAOIs(projectId: number) {
  return useQuery({
    queryKey: aoiKeys.all(projectId),
    queryFn: () => listAOIs(projectId),
    enabled: !!projectId,
  });
}

export function useAOI(projectId: number, aoiId: number) {
  return useQuery({
    queryKey: aoiKeys.detail(projectId, aoiId),
    queryFn: () => getAOI(projectId, aoiId),
    enabled: !!projectId && !!aoiId,
  });
}

export function useCreateAOI(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AOICreate) => createAOI(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoiKeys.all(projectId) });
    },
  });
}

export function useUpdateAOI(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      aoiId,
      data,
    }: {
      aoiId: number;
      data: AOIUpdate;
    }) => updateAOI(projectId, aoiId, data),
    onSuccess: (updatedAOI) => {
      queryClient.setQueryData(
        aoiKeys.detail(projectId, updatedAOI.id),
        updatedAOI
      );
      queryClient.invalidateQueries({ queryKey: aoiKeys.all(projectId) });
    },
  });
}

export function useDeleteAOI(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aoiId: number) => deleteAOI(projectId, aoiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoiKeys.all(projectId) });
    },
  });
}
