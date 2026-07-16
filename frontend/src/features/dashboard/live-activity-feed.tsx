import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/hooks/use-live-activity";

type LiveActivityFeedProps = {
  items: ActivityItem[];
};

export function LiveActivityFeed({ items }: LiveActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live Activity</CardTitle>
        <CardDescription>Real-time processed events via WebSocket</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-500">
            Waiting for events… Publish a purchase or sale to see live updates.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-stone-100 bg-stone-50/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={item.eventType === "PURCHASE" ? "purchase" : "sale"}>
                    {item.eventType}
                  </Badge>
                  <span className="text-xs text-stone-500">{formatDateTime(item.receivedAt)}</span>
                </div>
                <p className="mt-2 text-sm text-stone-800">
                  {item.quantity} units @ {formatMoney(item.unitPrice)}
                  {item.fifoCost ? ` · FIFO ${formatMoney(item.fifoCost)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
