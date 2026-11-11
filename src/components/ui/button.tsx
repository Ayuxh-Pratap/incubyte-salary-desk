"use client";
import { Button as Primitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
const variants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-ui font-medium transition-[background-color,box-shadow,color,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-button-primary hover:bg-primary-hover hover:shadow-button-primary-hover active:translate-y-px active:shadow-button-pressed",
        outline:
          "border-border bg-card text-foreground shadow-button hover:shadow-button-hover active:translate-y-px active:shadow-button-pressed",
        secondary:
          "border-transparent bg-inset text-foreground hover:bg-row-hover",
        ghost:
          "border-transparent text-foreground-2 hover:bg-row-hover hover:text-foreground",
        danger: "border-destructive text-destructive hover:bg-inset",
      },
      size: { default: "", icon: "size-11 p-0" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: Primitive.Props & VariantProps<typeof variants> & { loading?: boolean }) {
  return (
    <Primitive
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"] || undefined}
      className={cn(variants({ variant, size }), className)}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </Primitive>
  );
}
