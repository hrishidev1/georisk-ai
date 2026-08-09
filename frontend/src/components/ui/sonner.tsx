"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4.5 group-[.toaster]:text-sm group-[.toaster]:font-medium",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white rounded-full font-semibold text-xs px-3.5 py-1.5",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 rounded-full font-semibold text-xs px-3 py-1.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
