import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      purchase: "bg-emerald-100 text-emerald-800",
      sale: "bg-amber-100 text-amber-900",
      live: "bg-teal-100 text-teal-900",
      offline: "bg-stone-200 text-stone-700",
    },
  },
  defaultVariants: {
    variant: "live",
  },
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
