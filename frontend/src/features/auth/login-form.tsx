"use client";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLoginForm } from "@/hooks/use-login-form";

export function LoginForm() {
  const { register, onSubmit, serverError, errors, isSubmitting } = useLoginForm();

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@stocklens.com"
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
      </FormField>

      {serverError ? <FormAlert message={serverError} /> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
