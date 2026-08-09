"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle2, Sliders } from "lucide-react";

import { updateProjectSchema, type UpdateProjectFormValues } from "@/schemas/project";
import { useUpdateProject } from "@/hooks/use-projects";
import type { ProjectResponse } from "@/types/project";
import { getApiErrorMessage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface EditProjectFormProps {
  project: ProjectResponse;
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  const { mutateAsync: updateProject, isPending } = useUpdateProject(project.id);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
    },
  });

  const onSubmit = async (data: UpdateProjectFormValues) => {
    setError(null);
    setIsSuccess(false);
    try {
      await updateProject(data);
      setIsSuccess(true);
      toast.success("Workspace metadata synchronized with PostGIS.");
      setTimeout(() => setIsSuccess(false), 3500);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="p-7 sm:p-8 border-b border-slate-100 bg-[#FAFBFC]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0]">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1D20]">Workspace Metadata Configuration</h3>
            <p className="text-xs text-slate-500 font-normal">
              Modify repository identification titles and analytical scope boundaries for this GIS study region.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-7 sm:p-8 space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-[#FCE8E6] p-4 text-xs font-medium text-[#8C1D18]">
              {error}
            </div>
          )}

          <div className="space-y-2 max-w-lg">
            <label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Project Title
            </label>
            <Input
              id="name"
              placeholder="Study Region Title"
              disabled={isPending}
              {...register("name")}
              className={errors.name ? "border-red-500 h-12 rounded-xl" : "h-12 rounded-xl"}
            />
            {errors.name && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 max-w-2xl">
            <label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Study Scope &amp; Analytical Objectives
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Detail spatial extents, hazard prediction models, or regional coordinates..."
              disabled={isPending}
              {...register("description")}
              className="w-full rounded-xl border border-input bg-[#FAFBFD] p-3.5 text-sm text-foreground shadow-2xs transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0B57D0] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>

        <div className="px-7 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="rounded-full px-7 h-11 text-xs font-semibold bg-[#0B57D0] hover:bg-[#1A73E8] text-white shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Metadata Changes
              </>
            )}
          </Button>
          
          {isSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0D652D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 animate-in-fade">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Synchronized with PostGIS
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
