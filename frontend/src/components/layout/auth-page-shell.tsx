import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: ReactNode;
  maxWidth?: "md" | "lg";
  className?: string;
};

const maxWidthClass = {
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export function AuthPageShell({ children, maxWidth = "md", className }: AuthPageShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#dcfce7_0%,_#f8fafc_45%,_#f1f5f9_100%)]"
      />
      <div className={cn("relative w-full", maxWidthClass[maxWidth], className)}>{children}</div>
    </main>
  );
}
