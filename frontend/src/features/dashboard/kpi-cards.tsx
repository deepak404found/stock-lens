import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  DollarSign,
  Info,
  Tag,
  TrendingUp,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { DashboardData } from "@/types/inventory";

type KpiCardsProps = {
  kpis: DashboardData["kpis"];
  eventCount: number;
  streamingConnected: boolean;
};

export function KpiCards({ kpis, eventCount, streamingConnected }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Active Products"
        value={String(kpis.activeProducts)}
        hint={
          <span className="flex items-center font-medium text-emerald-600">
            <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
            All catalogs online
          </span>
        }
        icon={<Tag className="h-5 w-5" />}
        iconClass="bg-brand-50 text-brand-900"
      />
      <MetricCard
        label="Units on Hand"
        value={String(kpis.totalUnitsOnHand)}
        hint={
          <span className="flex items-center text-slate-500">
            <Info className="mr-1 h-3.5 w-3.5 text-slate-400" />
            Live stock count
          </span>
        }
        icon={<Boxes className="h-5 w-5" />}
        iconClass="bg-blue-50 text-blue-600"
      />
      <MetricCard
        label="Inventory Value"
        value={formatMoney(kpis.totalInventoryValue)}
        hint={
          <span className="flex items-center font-medium text-emerald-600">
            <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
            Dynamic FIFO valuation
          </span>
        }
        icon={<DollarSign className="h-5 w-5" />}
        iconClass="bg-emerald-50 text-emerald-700"
      />
      <MetricCard
        label="Event Count"
        value={String(eventCount)}
        hint={
          <span className="flex items-center font-medium text-amber-600">
            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            {streamingConnected ? "Kafka streaming online" : "Stream offline"}
          </span>
        }
        icon={<Activity className="h-5 w-5" />}
        iconClass="bg-amber-50 text-amber-700"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  hint: ReactNode;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
      <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition duration-300 group-hover:scale-110" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-950">{value}</h3>
          <p className="mt-2 text-[11px]">{hint}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}
