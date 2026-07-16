import { cn } from "@/lib/utils";

type FormAlertProps = {
  message: string;
  variant?: "error";
  className?: string;
};

export function FormAlert({ message, variant = "error", className }: FormAlertProps) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        variant === "error" && "border-red-200 bg-red-50 text-red-800",
        className,
      )}
    >
      {message}
    </p>
  );
}
