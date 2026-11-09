import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-600 text-white shadow-brand hover:bg-brand-700 hover:-translate-y-0.5",
        secondary:
          "bg-brand-900 text-white hover:bg-brand-800 hover:-translate-y-0.5",
        outline:
          "border border-brand-600/25 bg-white text-brand-700 hover:border-brand-600/60 hover:bg-brand-50",
        ghost: "text-brand-700 hover:bg-brand-50",
        subtle: "bg-brand-100 text-brand-800 hover:bg-brand-200",
        danger: "bg-danger text-white hover:bg-red-700",
        white: "bg-white text-brand-700 shadow-glow hover:-translate-y-0.5 hover:shadow-glow-hover",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonStyles({ variant, size, block }), className)} {...props} />
  );
}

type LinkButtonProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonStyles>;

export function LinkButton({ className, variant, size, block, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(buttonStyles({ variant, size, block }), className)} {...props} />
  );
}

export { buttonStyles };
