import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loading({ label = "Loading…", className }) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 p-8",
        className,
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}