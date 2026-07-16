import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { LoginForm } from "@/features/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <AuthPageShell className="space-y-8">
      <div>
        <Image
          src="/brand/stocklens-logo.png"
          alt="StockLens Live Warehouse"
          width={240}
          height={56}
          className="h-12 w-auto object-contain object-left"
          priority
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-slate-600">Real-time inventory intelligence for your operations.</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
    </AuthPageShell>
  );
}
