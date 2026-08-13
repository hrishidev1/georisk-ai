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
import { Activity } from "lucide-react";
import { useCreateProcessingJob } from "@/hooks/use-processing";
import type { ProcessorType } from "@/types/processing";
import { toast } from "sonner";

interface RunProcessorDialogProps {
  rasterId: number;
}

export function RunProcessorDialog({ rasterId }: RunProcessorDialogProps) {
  const [open, setOpen] = useState(false);
  const [processor, setProcessor] = useState<ProcessorType>("hillshade");
  const [azimuth, setAzimuth] = useState("315");
  const [altitude, setAltitude] = useState("45");
  const [zFactor, setZFactor] = useState("1.0");

  const createJob = useCreateProcessingJob();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let parameters: Record<string, unknown> = {};

    if (processor === "hillshade") {
      parameters = {
        azimuth: parseFloat(azimuth),
        altitude: parseFloat(altitude),
        z_factor: parseFloat(zFactor),
      };
    } else if (processor === "slope" || processor === "aspect") {
      parameters = {
        z_factor: parseFloat(zFactor),
      };
    }

    createJob.mutate(
      {
        raster_id: rasterId,
        processor,
        parameters,
      },
      {
        onSuccess: () => {
          toast.success("Processing job submitted successfully");
          setOpen(false);
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string | { msg?: string }[] } } };
          const detail = error.response?.data?.detail;
          const errorMessage = typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => (d as { msg?: string }).msg).filter(Boolean).join(", ")
              : "Failed to submit job";
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full px-4 text-xs font-semibold">
          <Activity className="h-4 w-4" />
          Run Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
              <Activity className="h-6 w-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-[#1A1D20]">
              Run Analytical Processor
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Submit this raster to the processing engine.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="processor" className="text-xs font-semibold uppercase text-slate-500">
                Algorithm
              </Label>
              <select
                id="processor"
                value={processor}
                onChange={(e) => setProcessor(e.target.value as ProcessorType)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
              >
                <option value="hillshade">Hillshade Generator</option>
                <option value="slope">Slope Calculator</option>
                <option value="aspect">Aspect Calculator</option>
                <option value="metadata">Metadata Extractor</option>
              </select>
            </div>

            {processor === "hillshade" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="azimuth" className="text-xs font-semibold uppercase text-slate-500">
                    Azimuth (°)
                  </Label>
                  <Input
                    id="azimuth"
                    type="number"
                    step="0.1"
                    value={azimuth}
                    onChange={(e) => setAzimuth(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="altitude" className="text-xs font-semibold uppercase text-slate-500">
                    Altitude (°)
                  </Label>
                  <Input
                    id="altitude"
                    type="number"
                    step="0.1"
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="zfactor" className="text-xs font-semibold uppercase text-slate-500">
                    Z-Factor
                  </Label>
                  <Input
                    id="zfactor"
                    type="number"
                    step="0.1"
                    value={zFactor}
                    onChange={(e) => setZFactor(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {(processor === "slope" || processor === "aspect") && (
              <div className="grid gap-2">
                <Label htmlFor="zfactor" className="text-xs font-semibold uppercase text-slate-500">
                  Z-Factor
                </Label>
                <Input
                  id="zfactor"
                  type="number"
                  step="0.1"
                  value={zFactor}
                  onChange={(e) => setZFactor(e.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                />
              </div>
            )}
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
              disabled={createJob.isPending}
              className="rounded-full h-11 px-6 bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white"
            >
              {createJob.isPending ? "Submitting..." : "Submit Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
