import { formatMoney } from "@/lib/format";
import type { ActivityItem } from "@/hooks/use-live-activity";

type LiveActivityFeedProps = {
  items: ActivityItem[];
};

export function LiveActivityFeed({ items }: LiveActivityFeedProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Live Activity Log</h3>
          <p className="text-xs text-slate-500">
            All products · real-time Redpanda websocket stream
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 animate-pulse-green rounded-full bg-emerald-500" />
          Listening
        </span>
      </div>

      <div className="h-64 space-y-2.5 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-100 shadow-inner sm:h-72">
        {items.length === 0 ? (
          <div className="font-medium text-emerald-400">
            {
              "// Waiting for events… Publish or Run Demo — logs for every product appear here."
            }
          </div>
        ) : (
          items.map((item) => {
            const isSale = item.eventType === "SALE";
            const isFailed = item.status === "failed";
            const time = item.receivedAt.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            return (
              <div key={item.id} className="leading-relaxed">
                <span className="text-slate-500">[{time}]</span>{" "}
                {isFailed ? (
                  <>
                    <span className="font-semibold text-rose-400">FAILED</span>{" "}
                    <span className="font-semibold text-amber-400">{item.eventType}</span>{" "}
                    {item.productLabel ? (
                      <span className="text-slate-400">{item.productLabel} </span>
                    ) : null}
                    <span className="text-rose-300">
                      qty={item.quantity} — {item.reason ?? "insufficient stock"}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={
                        isSale ? "font-semibold text-amber-400" : "font-semibold text-emerald-400"
                      }
                    >
                      {item.eventType}
                    </span>{" "}
                    {item.productLabel ? (
                      <span className="text-slate-400">{item.productLabel} </span>
                    ) : null}
                    <span className="text-slate-300">
                      qty={item.quantity}
                      {item.unitPrice != null ? ` @ $${formatMoney(item.unitPrice)}` : ""}
                      {item.fifoCost ? ` fifo=$${formatMoney(item.fifoCost)}` : ""}
                    </span>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
