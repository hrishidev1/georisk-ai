import React from "react";
import { useProcessingJobs, useCancelProcessingJob } from "@/hooks/use-processing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, XCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ProcessingStatus } from "@/types/processing";

interface ProcessingJobsPanelProps {
  projectId: number;
}

export function ProcessingJobsPanel({ projectId }: ProcessingJobsPanelProps) {
  // Poll every 2 seconds for progress updates
  const { data: jobs, isLoading } = useProcessingJobs({ project_id: projectId }, 2000);
  const cancelJob = useCancelProcessingJob();

  const handleCancel = (jobId: number) => {
    cancelJob.mutate(jobId, {
      onSuccess: () => {
        toast.success("Job cancellation requested");
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { detail?: string | unknown[] } } };
        const detail = error.response?.data?.detail;
        const errorMessage = typeof detail === "string" 
          ? detail 
          : Array.isArray(detail) 
            ? detail.map(d => (d as any).msg).join(", ") 
            : "Failed to cancel job";
        toast.error(errorMessage);
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="rounded-[24px] border border-slate-200/80 p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-full mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
          <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  const activeJobs = jobs?.filter(
    (j) => j.status === "PENDING" || j.status === "QUEUED" || j.status === "RUNNING" || j.status === "CANCELLING"
  ) || [];

  const completedJobs = jobs?.filter(
    (j) => j.status === "COMPLETED" || j.status === "FAILED" || j.status === "CANCELLED"
  ) || [];

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-slate-500" />;
      case "RUNNING":
      case "CANCELLING":
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200/60";
      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "RUNNING":
      case "CANCELLING":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
  };

  return (
    <Card className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
            <Activity className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1D20]">Processing Engine</h3>
            <p className="text-xs text-slate-500">Active and recent tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
            {activeJobs.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[600px] scrollbar-thin">
        {jobs?.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No processing jobs have been submitted yet.
          </div>
        ) : (
          <>
            {activeJobs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">Active Tasks</h4>
                <div className="space-y-2">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${job.progress}%` }}></div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)}
                            {job.status}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {job.processor.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400">ID: {job.id}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 truncate pr-4">{job.message || "Initializing..."}</span>
                          <span className="font-bold text-[#0B57D0]">{job.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#0B57D0] transition-all duration-300" style={{ width: `${job.progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(job.id)}
                          disabled={cancelJob.isPending || job.status === "CANCELLING"}
                          className="h-8 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          {job.status === "CANCELLING" ? "Cancelling..." : "Cancel Task"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedJobs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mt-4">History</h4>
                <div className="space-y-2">
                  {completedJobs.map((job) => (
                    <div key={job.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="text-sm font-semibold text-slate-700">
                            {job.processor.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {job.status === "COMPLETED" ? `Finished successfully. ${job.message}` : 
                           job.status === "FAILED" ? `Failed: ${job.message}` : 
                           "Cancelled by user."}
                        </span>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
