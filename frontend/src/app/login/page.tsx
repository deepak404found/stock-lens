import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell className="space-y-8">
      <div>
        <p className="text-xl font-extrabold tracking-tight text-slate-900">
          STOCK<span className="font-light text-brand-900">LENS</span>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-slate-600">Real-time inventory intelligence for your operations.</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
    </AuthPageShell>
  );
}
