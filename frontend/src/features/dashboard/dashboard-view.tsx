"use client";

import { AppShell } from "@/components/layout/app-shell";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { LiveActivityFeed } from "@/features/dashboard/live-activity-feed";
import { ProductStockTable } from "@/features/dashboard/product-stock-table";
import { StreamingStatus } from "@/features/dashboard/streaming-status";
import { TransactionLedger } from "@/features/dashboard/transaction-ledger";
import { EventPublisherPanel } from "@/features/event-publisher/event-publisher-panel";
import { useDashboard } from "@/hooks/use-dashboard";
import { useInventorySocket } from "@/hooks/use-inventory-socket";
import { useLiveActivity } from "@/hooks/use-live-activity";
import { useSession } from "@/hooks/use-session";

export function DashboardView() {
  const { user, isLoading: sessionLoading, logout } = useSession();
  const dashboardQuery = useDashboard();
  const { items: liveItems, addProcessedEvent } = useLiveActivity();

  useInventorySocket(addProcessedEvent);

  if (sessionLoading || dashboardQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-600">Loading dashboard…</p>
      </main>
    );
  }

  if (!user || !dashboardQuery.data) {
    return null;
  }

  const dashboard = dashboardQuery.data;

  return (
    <AppShell userName={user.fullName} userEmail={user.email} onLogout={logout}>
      <div className="space-y-6">
        <KpiCards kpis={dashboard.kpis} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductStockTable rows={dashboard.productStock} />
          </div>
          <EventPublisherPanel />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionLedger transactions={dashboard.recentTransactions} />
          </div>
          <div className="space-y-6">
            <StreamingStatus status={dashboard.streamingStatus} />
            <LiveActivityFeed items={liveItems} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
