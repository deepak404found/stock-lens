import type { ReactNode } from "react";
import { LogOut, Package, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  streamingConnected: boolean;
  onPublishClick: () => void;
  className?: string;
  footer?: ReactNode;
};

export function AppShell({
  children,
  userName,
  userEmail,
  onLogout,
  streamingConnected,
  onPublishClick,
  className,
  footer,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white shadow-md shadow-brand-900/20">
              <Package className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-slate-900">
                STOCK<span className="font-light text-brand-900">LENS</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-800">
                Live Warehouse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={cn(
                "hidden items-center rounded-full border px-3 py-1.5 text-xs font-medium md:flex",
                streamingConnected
                  ? "border-emerald-200/50 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              <span className="relative mr-2 flex h-2 w-2">
                {streamingConnected ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-400" />
                )}
              </span>
              Kafka Stream: {streamingConnected ? "Connected" : "Offline"}
            </div>

            <Button
              type="button"
              onClick={onPublishClick}
              className="rounded-xl bg-brand-900 px-4 shadow-sm hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-900/10 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Publish Event</span>
              <span className="sm:hidden">Publish</span>
            </Button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-semibold text-slate-900">{userName}</p>
                <p className="text-[10px] text-slate-500">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8", className)}>
        {children}
      </main>

      {footer}
    </div>
  );
}
