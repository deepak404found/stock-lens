import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-stone-200/80 bg-white/90 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("border-b border-stone-100 px-5 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={cn("text-lg font-semibold text-stone-900", className)}>{children}</h2>;
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("mt-1 text-sm text-stone-500", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
