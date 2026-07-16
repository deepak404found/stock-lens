"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getMe, logout as logoutRequest } from "@/services/auth";

const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

export function useSession() {
  const router = useRouter();

  const meQuery = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: getMe,
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  return {
    user: meQuery.data,
    isLoading: meQuery.isPending,
    isAuthenticated: Boolean(meQuery.data),
    logout,
  };
}
