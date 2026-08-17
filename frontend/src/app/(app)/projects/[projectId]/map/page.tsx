"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { GISWorkspace } from "@/components/gis/gis-workspace";

export default function ProjectGISMapPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const projectId = Number(params?.projectId);
  const rasterParam = searchParams.get("raster");
  const initialRasterId = rasterParam ? Number(rasterParam) : null;

  if (!projectId) return null;

  return (
    <div className="w-full h-full pb-4">
      <GISWorkspace projectId={projectId} initialRasterId={initialRasterId} />
    </div>
  );
}
