import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-[#1558D6] hover:shadow-md hover:shadow-blue-500/10 rounded-full px-5 py-2.5 text-sm",
        destructive:
          "bg-[#B3261E] text-white shadow-sm hover:bg-[#9C1C14] hover:shadow-md hover:shadow-red-500/10 rounded-full px-5 py-2.5 text-sm",
        destructive_subtle:
          "bg-[#FCE8E6] text-[#8C1D18] hover:bg-[#F9D4D0] rounded-full px-4 py-2 text-xs font-semibold",
        outline:
          "border border-border bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-foreground rounded-full px-5 py-2.5 text-sm",
        secondary:
          "bg-[#F0F4F8] text-[#3C4043] hover:bg-[#E2E8F0] hover:text-foreground rounded-full px-5 py-2.5 text-sm",
        ghost:
          "hover:bg-[#F0F4F8]/80 text-[#5F6368] hover:text-foreground rounded-full px-4 py-2 text-sm",
        link:
          "text-primary font-semibold underline-offset-4 hover:underline p-0 h-auto rounded-none text-sm",
        pill:
          "bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC] rounded-full px-4 py-1.5 text-xs font-semibold shadow-2xs",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs rounded-full",
        lg: "h-12 px-7 text-base rounded-full",
        icon: "h-10 w-10 rounded-full p-0 flex items-center justify-center",
        icon_sm: "h-8 w-8 rounded-full p-0 flex items-center justify-center text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
