import { api, type ApiSuccess } from "@/lib/api";
import type { DashboardData } from "@/types/inventory";

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiSuccess<DashboardData>>("/api/v1/dashboard");
  return data.data;
}
