"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

import { useDeleteProject } from "@/hooks/use-projects";
import { getApiErrorMessage } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteProjectDialogProps {
  projectId: number;
  projectName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteProjectDialog({
  projectId,
  projectName,
  onSuccess,
  trigger,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteProject, isPending } = useDeleteProject();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteProject(projectId);
      toast.success(`Workspace "${projectName}" removed cleanly.`);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="icon_sm"
            className="h-8 w-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-[#B3261E] transition-colors shrink-0"
            title="Delete Workspace"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-7" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FCE8E6] text-[#B3261E]">
              <AlertTriangle className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1A1D20]">
                Delete Study Area?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                This transaction cannot be reversed once confirmed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            You are about to permanently eradicate <strong className="font-semibold text-slate-900">&ldquo;{projectName}&rdquo;</strong> (ID #{projectId}) and all associated PostGIS schemas.
          </p>
          <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/60 text-xs text-amber-900 font-medium">
            &bull; All linked GeoTIFF files and polygon boundaries will be purged from active disk storage.
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full px-6 text-xs font-semibold bg-[#B3261E] hover:bg-[#9C1C14] text-white shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Purging repository...
              </>
            ) : (
              "Confirm Deletion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
