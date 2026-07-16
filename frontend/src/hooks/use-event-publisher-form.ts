"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "@/lib/api";
import { eventPublisherSchema, type EventPublisherFormValues } from "@/schemas/event-publisher";
import { publishEvent } from "@/services/events";

const emptyDefaults: EventPublisherFormValues = {
  eventType: "PURCHASE",
  productId: "",
  quantity: 1,
  unitPrice: 0,
};

export type PublishSuccessResult = {
  eventId: string;
  eventType: EventPublisherFormValues["eventType"];
  quantity: number;
  unitPrice?: number;
};

export function useEventPublisherForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<PublishSuccessResult | null>(null);

  const form = useForm<EventPublisherFormValues>({
    resolver: zodResolver(eventPublisherSchema),
    defaultValues: emptyDefaults,
  });

  const submit = useCallback(
    async (values: EventPublisherFormValues) => {
      setServerError(null);
      setPendingEventId(null);
      setLastPublished(null);
      try {
        if (values.eventType === "PURCHASE") {
          const result = await publishEvent({
            eventType: "PURCHASE",
            productId: values.productId,
            quantity: values.quantity,
            unitPrice: values.unitPrice,
          });
          setPendingEventId(result.eventId);
          setLastPublished({
            eventId: result.eventId,
            eventType: "PURCHASE",
            quantity: values.quantity,
            unitPrice: values.unitPrice,
          });
        } else {
          const result = await publishEvent({
            eventType: "SALE",
            productId: values.productId,
            quantity: values.quantity,
          });
          setPendingEventId(result.eventId);
          setLastPublished({
            eventId: result.eventId,
            eventType: "SALE",
            quantity: values.quantity,
          });
        }
      } catch (error) {
        setPendingEventId(null);
        setLastPublished(null);
        setServerError(getApiErrorMessage(error, "Failed to publish event"));
      }
    },
    [],
  );

  const onSubmit = form.handleSubmit(submit);

  const clearFeedback = useCallback(() => {
    setServerError(null);
    setPendingEventId(null);
    setLastPublished(null);
  }, []);

  const resetForm = useCallback(
    (values?: Partial<EventPublisherFormValues>) => {
      clearFeedback();
      form.reset({ ...emptyDefaults, ...values } as EventPublisherFormValues);
    },
    [clearFeedback, form],
  );

  return {
    register: form.register,
    watch: form.watch,
    setValue: form.setValue,
    onSubmit,
    serverError,
    setServerError,
    pendingEventId,
    lastPublished,
    clearPending: () => setPendingEventId(null),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    clearFeedback,
    resetForm,
  };
}
