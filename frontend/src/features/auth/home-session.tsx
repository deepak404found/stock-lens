"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function HomeSession() {
  const { user, isLoading, logout } = useSession();

  if (isLoading) {
    return <p className="text-stone-600">Checking session…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-teal-800">StockLens</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">You’re signed in</h1>
        <p className="mt-2 text-stone-600">
          Welcome back, {user.fullName} ({user.email}).
        </p>
      </div>
      <Button type="button" variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
