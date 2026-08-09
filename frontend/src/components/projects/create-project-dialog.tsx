"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles } from "lucide-react";

import { createProjectSchema, type CreateProjectFormValues } from "@/schemas/project";
import { useCreateProject } from "@/hooks/use-projects";
import { getApiErrorMessage } from "@/types/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateProjectFormValues) => {
    setError(null);
    try {
      await createProject(data);
      toast.success("Geospatial workspace initialized in PostGIS!");
      reset();
      setOpen(false);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      reset();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full font-semibold bg-[#0B57D0] hover:bg-[#1A73E8] px-6 h-11 shadow-md shadow-blue-600/20 text-white flex items-center gap-2">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Project Workspace</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Initialize Study Repository</DialogTitle>
              <DialogDescription className="text-xs pt-0.5">
                Configure basic project identification before importing raster datasets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {error && (
            <div className="rounded-2xl bg-[#FCE8E6] p-4 text-xs font-medium text-[#8C1D18] border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Workspace Title
            </label>
            <Input
              id="name"
              placeholder="e.g., Himalayan Slope Instability Analysis 2026"
              disabled={isPending}
              className="h-12 rounded-xl"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Study Scope Description (Optional)
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Detail spatial extents, target resolution, or hazard forecast hypotheses..."
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-[#FAFBFD] p-3.5 text-sm text-foreground shadow-2xs transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0B57D0] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="rounded-full px-6 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full px-7 text-xs font-semibold bg-[#0B57D0] hover:bg-[#1A73E8] text-white shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                "Deploy Repository"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
