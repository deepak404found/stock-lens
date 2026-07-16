import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  className?: string;
};

export function AppShell({ children, userName, userEmail, onLogout, className }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#d7ebe6_0%,_#f5f1ea_45%,_#efe8dc_100%)]"
      />
      <div className="relative">
        <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-800">StockLens</p>
              <h1 className="text-xl font-semibold text-stone-900">Inventory Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-stone-900">{userName}</p>
                <p className="text-xs text-stone-500">{userEmail}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className={cn("mx-auto max-w-7xl px-6 py-8", className)}>{children}</main>
      </div>
    </div>
  );
}
