import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/types/inventory";

type StreamingStatusProps = {
  status: DashboardData["streamingStatus"];
};

export function StreamingStatus({ status }: StreamingStatusProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Event Streaming</CardTitle>
          <CardDescription>Redpanda consumer status</CardDescription>
        </div>
        <Badge variant={status.connected ? "live" : "offline"}>
          {status.connected ? "Connected" : "Disconnected"}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-stone-600">
          Topic: <span className="font-mono text-stone-800">{status.topic}</span>
        </p>
      </CardContent>
    </Card>
  );
}
