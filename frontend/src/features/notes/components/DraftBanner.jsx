import { Button } from "@/components/ui/button";

export function DraftBanner({ onRestore, onDiscard }) {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          An unsaved draft from an earlier session is available.
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={onRestore}
          >
            Restore
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px]"
            onClick={onDiscard}
          >
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
}