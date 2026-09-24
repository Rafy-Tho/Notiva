import { Button } from "@/components/ui/button";

export function ErrorState({ title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}