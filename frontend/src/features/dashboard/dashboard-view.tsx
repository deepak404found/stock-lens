"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { LiveActivityFeed } from "@/features/dashboard/live-activity-feed";
import { ProductStockTable } from "@/features/dashboard/product-stock-table";
import { TransactionLedger } from "@/features/dashboard/transaction-ledger";
import { EventPublisherModal } from "@/features/event-publisher/event-publisher-modal";
import { useDashboard } from "@/hooks/use-dashboard";
import { useInventorySocket } from "@/hooks/use-inventory-socket";
import { useLiveActivity } from "@/hooks/use-live-activity";
import { useSession } from "@/hooks/use-session";

export function DashboardView() {
  const { user, isLoading: sessionLoading, logout } = useSession();
  const dashboardQuery = useDashboard();
  const { items: liveItems, addProcessedEvent, addFailedEvent } = useLiveActivity();
  const [publisherOpen, setPublisherOpen] = useState(false);

  useInventorySocket({ onProcessed: addProcessedEvent, onFailed: addFailedEvent });

  if (sessionLoading || dashboardQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading dashboard…</p>
      </main>
    );
  }

  if (!user || !dashboardQuery.data) {
    return null;
  }

  const dashboard = dashboardQuery.data;
  const streamingConnected = dashboard.streamingStatus.connected;

  return (
    <>
      <AppShell
        userName={user.fullName}
        userEmail={user.email}
        onLogout={logout}
        streamingConnected={streamingConnected}
        onPublishClick={() => setPublisherOpen(true)}
        className="space-y-8"
        footer={
          <footer className="mt-auto border-t border-slate-200 bg-white py-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 md:flex-row lg:px-8">
              <div>
                Topic:{" "}
                <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-800">
                  {dashboard.streamingStatus.topic}
                </code>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Broker: <span className="font-semibold text-slate-700">Redpanda Cloud</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Stream:{" "}
                  <span
                    className={
                      streamingConnected
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-rose-600"
                    }
                  >
                    {streamingConnected ? "Healthy" : "Offline"}
                  </span>
                </span>
              </div>
            </div>
          </footer>
        }
      >
        <KpiCards
          kpis={dashboard.kpis}
          eventCount={dashboard.recentTransactions.length}
          streamingConnected={streamingConnected}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductStockTable rows={dashboard.productStock} />
          </div>
          <LiveActivityFeed items={liveItems} />
        </div>

        <TransactionLedger transactions={dashboard.recentTransactions} />
      </AppShell>

      <EventPublisherModal open={publisherOpen} onClose={() => setPublisherOpen(false)} />
    </>
  );
}
