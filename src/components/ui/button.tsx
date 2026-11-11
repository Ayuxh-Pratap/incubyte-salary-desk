"use client";
import { Button as Primitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
const variants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-ui font-medium transition-[background-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-button hover:brightness-110",
        outline:
          "border-border bg-card text-foreground shadow-button hover:bg-muted",
        ghost: "border-transparent text-foreground-2 hover:bg-muted",
        danger: "border-destructive text-destructive",
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
      aria-busy={loading || undefined}
      className={cn(variants({ variant, size }), className)}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </Primitive>
  );
}
