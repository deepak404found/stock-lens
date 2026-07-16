"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FifoLayersPanel } from "@/features/dashboard/fifo-layers-panel";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { LiveActivityFeed } from "@/features/dashboard/live-activity-feed";
import { ProductStockTable } from "@/features/dashboard/product-stock-table";
import { TransactionLedger } from "@/features/dashboard/transaction-ledger";
import { EventPublisherModal } from "@/features/event-publisher/event-publisher-modal";
import { RunDemoModal } from "@/features/simulator/run-demo-modal";
import { useDashboard } from "@/hooks/use-dashboard";
import { useInventorySocket } from "@/hooks/use-inventory-socket";
import { useLiveActivity } from "@/hooks/use-live-activity";
import { useSession } from "@/hooks/use-session";
import { useSimulator } from "@/hooks/use-simulator";
import { useTransactions } from "@/hooks/use-transactions";

export function DashboardView() {
  const { user, isLoading: sessionLoading, logout } = useSession();
  const dashboardQuery = useDashboard();
  const { items: liveItems, addProcessedEvent, addFailedEvent } = useLiveActivity();
  const simulator = useSimulator();
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [fifoFlashKey, setFifoFlashKey] = useState<string | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const transactionsQuery = useTransactions(ledgerPage);
  const selectedProductIdRef = useRef(selectedProductId);
  selectedProductIdRef.current = selectedProductId;

  const productStock = useMemo(
    () => dashboardQuery.data?.productStock ?? [],
    [dashboardQuery.data?.productStock],
  );

  const productLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of productStock) {
      map.set(row.productId, row.sku);
    }
    return map;
  }, [productStock]);
  const productLabelByIdRef = useRef(productLabelById);
  productLabelByIdRef.current = productLabelById;

  useInventorySocket({
    onProcessed: (payload) => {
      addProcessedEvent(payload, productLabelByIdRef.current.get(payload.productId));
      if (payload.productId === selectedProductIdRef.current) {
        setFifoFlashKey(`${payload.eventId}-${Date.now()}`);
      }
    },
    onFailed: (payload) => {
      addFailedEvent(payload, productLabelByIdRef.current.get(payload.productId));
    },
  });

  useEffect(() => {
    if (!selectedProductId) return;
    if (!productStock.some((p) => p.productId === selectedProductId)) {
      setSelectedProductId(null);
    }
  }, [productStock, selectedProductId]);

  const selectedProduct = useMemo(
    () => productStock.find((p) => p.productId === selectedProductId) ?? null,
    [productStock, selectedProductId],
  );

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
  const simRunning = simulator.isRunning;

  return (
    <>
      <AppShell
        userName={user.fullName}
        userEmail={user.email}
        onLogout={logout}
        streamingConnected={streamingConnected}
        onPublishClick={() => setPublisherOpen(true)}
        onRunDemoClick={() => setDemoOpen(true)}
        onStopSimulation={() => void simulator.stop()}
        simulation={simulator.status}
        publishDisabled={simRunning}
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
          eventCount={transactionsQuery.data?.pagination.total ?? dashboard.recentTransactions.length}
          streamingConnected={streamingConnected}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ProductStockTable
              rows={dashboard.productStock}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
            />
          </div>
          <div className="lg:col-span-2">
            <FifoLayersPanel product={selectedProduct} flashKey={fifoFlashKey} />
          </div>
        </div>

        <LiveActivityFeed items={liveItems} />

        <TransactionLedger page={ledgerPage} onPageChange={setLedgerPage} />
      </AppShell>

      <EventPublisherModal
        open={publisherOpen && !simRunning}
        onClose={() => setPublisherOpen(false)}
      />
      <RunDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        onStart={simulator.start}
        isStarting={simulator.isStarting}
        error={simulator.error}
        isRunning={simRunning}
        published={simulator.status.published}
        total={simulator.status.total}
      />
    </>
  );
}
