import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJob, getJob, listJobs, cancelJob } from "@/api/processing";
import type { ProcessingRequest, ProcessingStatus } from "@/types/processing";

export const processingKeys = {
  all: ["processing", "jobs"] as const,
  list: (params?: { project_id?: number; raster_id?: number; status?: ProcessingStatus }) =>
    ["processing", "jobs", "list", params] as const,
  detail: (jobId: number) => ["processing", "jobs", jobId] as const,
};

export function useProcessingJobs(params?: {
  project_id?: number;
  raster_id?: number;
  status?: ProcessingStatus;
}, refetchInterval?: number) {
  return useQuery({
    queryKey: processingKeys.list(params),
    queryFn: () => listJobs(params),
    refetchInterval,
  });
}

export function useProcessingJob(jobId: number, refetchInterval?: number) {
  return useQuery({
    queryKey: processingKeys.detail(jobId),
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
    refetchInterval,
  });
}

export function useCreateProcessingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcessingRequest) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
    },
  });
}

export function useCancelProcessingJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) => cancelJob(jobId),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(processingKeys.detail(updatedJob.id), updatedJob);
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
    },
  });
}
