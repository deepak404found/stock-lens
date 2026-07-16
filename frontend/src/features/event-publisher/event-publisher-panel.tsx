"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEventPublisherForm } from "@/hooks/use-event-publisher-form";
import { useProducts } from "@/hooks/use-products";

export function EventPublisherPanel() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const {
    register,
    onSubmit,
    serverError,
    successMessage,
    errors,
    isSubmitting,
  } = useEventPublisherForm();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Publisher</CardTitle>
        <CardDescription>Publish purchase or sale events to Redpanda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField id="eventType" label="Event type" error={errors.eventType?.message}>
            <Select id="eventType" {...register("eventType")}>
              <option value="PURCHASE">Purchase</option>
              <option value="SALE">Sale</option>
            </Select>
          </FormField>

          <FormField id="productId" label="Product" error={errors.productId?.message}>
            <Select
              id="productId"
              {...register("productId")}
              disabled={productsLoading || !products?.length}
            >
              <option value="">Select a product</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} — {product.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="quantity" label="Quantity" error={errors.quantity?.message}>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                {...register("quantity", { valueAsNumber: true })}
              />
            </FormField>
            <FormField id="unitPrice" label="Unit price" error={errors.unitPrice?.message}>
              <Input
                id="unitPrice"
                type="number"
                min={0.01}
                step={0.01}
                {...register("unitPrice", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          {serverError ? <FormAlert message={serverError} /> : null}
          {successMessage ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting || productsLoading}>
            {isSubmitting ? "Publishing…" : "Publish event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
