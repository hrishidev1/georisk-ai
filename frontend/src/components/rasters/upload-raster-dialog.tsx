import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileType2 } from "lucide-react";
import { useUploadRaster } from "@/hooks/use-rasters";
import type { RasterType } from "@/types/raster";
import { toast } from "sonner";

interface UploadRasterDialogProps {
  projectId: number;
}

export function UploadRasterDialog({ projectId }: UploadRasterDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RasterType>("dem");
  
  const upload = useUploadRaster(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    upload.mutate(
      {
        data: { name, description, type },
        file,
      },
      {
        onSuccess: () => {
          toast.success("Raster uploaded successfully");
          setOpen(false);
          setFile(null);
          setName("");
          setDescription("");
          setType("dem");
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string | unknown[] } } };
          const detail = error.response?.data?.detail;
          const errorMessage = typeof detail === "string" 
            ? detail 
            : Array.isArray(detail) 
              ? detail.map(d => (d as any).msg).join(", ") 
              : "Failed to upload raster";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        // Auto-fill name without extension
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white rounded-full px-6">
          <UploadCloud className="h-4 w-4" />
          Upload GeoTIFF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0] shadow-sm">
              <FileType2 className="h-6 w-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-[#1A1D20]">
              Import Raster
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Upload a GeoTIFF image to your project workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="file" className="text-xs font-semibold uppercase text-slate-500">
                GeoTIFF File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".tif,.tiff"
                onChange={handleFileChange}
                required
                className="rounded-xl border-slate-200 cursor-pointer file:text-[#0B57D0] file:bg-[#E8F0FE] file:border-0 file:rounded-lg file:mr-4 file:px-3 file:py-1 file:font-semibold file:text-xs"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase text-slate-500">
                Layer Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border-slate-200 px-4 bg-slate-50/50"
                placeholder="e.g. SRTM_30m_DEM"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="text-xs font-semibold uppercase text-slate-500">
                Raster Type
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as RasterType)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent"
              >
                <option value="dem">Digital Elevation Model (DEM)</option>
                <option value="satellite">Satellite Imagery</option>
                <option value="land_cover">Land Cover</option>
                <option value="slope">Slope</option>
                <option value="aspect">Aspect</option>
                <option value="hillshade">Hillshade</option>
                <option value="prediction">Prediction / AI Output</option>
                <option value="uncertainty">Uncertainty Map</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase text-slate-500">
                Description (Optional)
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 rounded-xl border-slate-200 px-4 bg-slate-50/50"
                placeholder="Brief details about this dataset"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mt-2 sm:mt-0 rounded-full h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || upload.isPending}
              className="rounded-full h-11 px-6 bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white"
            >
              {upload.isPending ? "Uploading..." : "Upload Raster"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
