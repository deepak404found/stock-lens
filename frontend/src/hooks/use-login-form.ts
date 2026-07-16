"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/schemas/login";
import { login } from "@/services/auth";

export function useLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submit = useCallback(
    async (values: LoginFormValues) => {
      setServerError(null);
      try {
        await login(values.email, values.password);
        router.replace("/");
        router.refresh();
      } catch (error) {
        setServerError(getApiErrorMessage(error, "Invalid email or password"));
      }
    },
    [router],
  );

  const onSubmit = form.handleSubmit(submit);

  return {
    register: form.register,
    onSubmit,
    serverError,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
}
