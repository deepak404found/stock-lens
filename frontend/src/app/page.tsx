import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { HomeSession } from "@/features/auth/home-session";

export default function HomePage() {
  return (
    <AuthPageShell maxWidth="lg">
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-sm backdrop-blur">
        <HomeSession />
      </div>
    </AuthPageShell>
  );
}
