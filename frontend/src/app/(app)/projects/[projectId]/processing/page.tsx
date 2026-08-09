"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Activity } from "lucide-react";
import { ProcessingJobsPanel } from "@/components/processing/processing-jobs-panel";

export default function ProcessingPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1D20]">Hazard Forecasting Analytics</h2>
          </div>
          <p className="text-sm text-slate-500 pl-10">
            Monitor and manage asynchronous geospatial processing jobs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ProcessingJobsPanel projectId={projectId} />
      </div>
    </div>
  );
}
