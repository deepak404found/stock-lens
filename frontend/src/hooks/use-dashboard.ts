"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboard,
    enabled,
    retry: false,
  });
}
