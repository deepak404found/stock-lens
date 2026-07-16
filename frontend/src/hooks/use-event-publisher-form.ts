"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "@/lib/api";
import { eventPublisherSchema, type EventPublisherFormValues } from "@/schemas/event-publisher";
import { publishEvent } from "@/services/events";

export function useEventPublisherForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<EventPublisherFormValues>({
    resolver: zodResolver(eventPublisherSchema),
    defaultValues: {
      eventType: "PURCHASE",
      productId: "",
      quantity: 1,
      unitPrice: 100,
    },
  });

  const submit = useCallback(async (values: EventPublisherFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const result = await publishEvent(values);
      setSuccessMessage(`Event accepted (${result.eventId.slice(0, 8)}…). Processing…`);
      form.reset({
        eventType: values.eventType,
        productId: values.productId,
        quantity: 1,
        unitPrice: values.unitPrice,
      });
    } catch (error) {
      setSuccessMessage(null);
      setServerError(getApiErrorMessage(error, "Failed to publish event"));
    }
  }, [form]);

  const onSubmit = form.handleSubmit(submit);

  return {
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    onSubmit,
    serverError,
    successMessage,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
}
