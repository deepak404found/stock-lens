import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-900">StockLens</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">Sign in</h1>
        <p className="mt-2 text-stone-600">Real-time inventory intelligence for your operations.</p>
      </div>
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
        <LoginForm />
      </div>
    </AuthPageShell>
  );
}
