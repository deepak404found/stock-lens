import { api, type ApiSuccess } from "@/lib/api";

export type SimulatorStatus = {
  status: "running" | "stopped" | "completed";
  mode: "burst";
  published: number;
  total: number;
  startedAt: string;
  finishedAt?: string;
};

export type StartSimulatorInput = {
  mode: "burst";
  eventCount: 5 | 10;
  delayMs: 500 | 1000 | 2000;
  productIds?: string[];
  autoSeed: boolean;
};

export async function startSimulator(input: StartSimulatorInput): Promise<SimulatorStatus> {
  const { data } = await api.post<ApiSuccess<SimulatorStatus>>("/api/v1/simulator/start", input);
  return data.data;
}

export async function stopSimulator(): Promise<SimulatorStatus> {
  const { data } = await api.post<ApiSuccess<SimulatorStatus>>("/api/v1/simulator/stop");
  return data.data;
}

export async function getSimulatorStatus(): Promise<SimulatorStatus> {
  const { data } = await api.get<ApiSuccess<SimulatorStatus>>("/api/v1/simulator/status");
  return data.data;
}
