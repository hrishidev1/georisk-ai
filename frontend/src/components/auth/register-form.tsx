"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { useRegister } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync: registerUser, isPending } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      await registerUser(data);
      toast.success("Workspace account provisioned successfully!");
      router.replace("/dashboard");
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="rounded-[28px] p-2 sm:p-4 shadow-xl shadow-slate-200/60 border-slate-200/80 bg-white">
      <CardContent className="pt-6 px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#FCE8E6] px-4 py-3.5 text-xs font-medium text-[#8C1D18] border border-red-100 animate-in-fade">
              <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="analyst@georisk.ai"
              autoComplete="email"
              disabled={isPending}
              className="h-12 px-4 rounded-xl text-sm bg-slate-50/70"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="full_name"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Analyst Full Name
            </label>
            <Input
              id="full_name"
              type="text"
              placeholder="Dr. Elena Vance"
              autoComplete="name"
              disabled={isPending}
              className="h-12 px-4 rounded-xl text-sm bg-slate-50/70"
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1"
            >
              Create Master Password (8+ characters)
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isPending}
              className="h-12 px-4 rounded-xl text-sm bg-slate-50/70"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-[#B3261E] pl-1">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 text-sm font-semibold rounded-full bg-[#0B57D0] hover:bg-[#1A73E8] shadow-md shadow-blue-600/15 group transition-all duration-200"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Provisioning repository...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Create project repository
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
            <span>Already have an active credential?</span>
            <Link
              href="/login"
              className="font-semibold text-[#0B57D0] hover:text-[#174EA6] hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0D652D]" />
            <span>Instant sandbox deployment upon registration</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
