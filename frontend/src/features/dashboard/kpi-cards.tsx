import { formatMoney } from "@/lib/format";
import type { DashboardData } from "@/types/inventory";
import { Card, CardContent } from "@/components/ui/card";

type KpiCardsProps = {
  kpis: DashboardData["kpis"];
};

const items = [
  { key: "activeProducts" as const, label: "Active Products" },
  { key: "totalUnitsOnHand" as const, label: "Units on Hand" },
  { key: "totalInventoryValue" as const, label: "Inventory Value" },
];

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const value = kpis[item.key];
        const display =
          item.key === "totalInventoryValue" ? formatMoney(value) : String(value);

        return (
          <Card key={item.key}>
            <CardContent className="py-5">
              <p className="text-sm text-stone-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{display}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
