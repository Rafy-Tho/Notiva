import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useMemo } from "react";
import { htmlToText, readingTime, wordCount } from "@/lib/sanitize";

export function NoteStatusBar({
  content,
  focusing,
  onToggleFocus,
  status,
  isDirty,
  lastSavedAt,
  actionPending,
}) {
  const stats = useMemo(() => {
    const text = htmlToText(content || "").trim();
    return {
      words: wordCount(content || ""),
      chars: text.replace(/\s+/g, "").length,
    };
  }, [content]);

  return (
    <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border bg-background/80 backdrop-blur px-4 sm:px-6 md:px-10 lg:px-12">
      <div className="flex h-8 items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground overflow-hidden">
        <span className="tabular-nums whitespace-nowrap">
          {stats.words.toLocaleString()} words
        </span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums whitespace-nowrap">
          {stats.chars.toLocaleString()} chars
        </span>
        <span aria-hidden="true" className="hidden sm:inline">
          ·
        </span>
        <span className="hidden sm:inline whitespace-nowrap">
          {readingTime(stats.words)}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <SaveState
          status={actionPending ? "updating" : status}
          isDirty={isDirty}
          lastSavedAt={lastSavedAt}
        />
        <button
          type="button"
          onClick={onToggleFocus}
          title={
            focusing
              ? "Exit focus mode (⌘/)"
              : "Focus mode (⌘/) — hide everything but the writing"
          }
          aria-label={focusing ? "Exit focus mode" : "Enter focus mode"}
          aria-pressed={focusing}
          className={cnFocusBtn(focusing)}
        >
          {focusing ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {focusing ? "Exit focus" : "Focus"}
          </span>
        </button>
      </div>
    </div>
  );
}

function SaveState({ status, isDirty, lastSavedAt }) {
  if (status === "updating" || status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">
          {status === "updating" ? "Updating…" : "Saving…"}
        </span>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-destructive whitespace-nowrap">
        <AlertCircle className="h-3 w-3" />
        Save failed
      </span>
    );
  }

  if (status === "conflict") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-destructive whitespace-nowrap">
        <AlertCircle className="h-3 w-3" />
        Conflict
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-warning whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Unsaved
      </span>
    );
  }

  if (status === "saved" || lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3 text-success" />
        Saved
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-border" />
      Draft
    </span>
  );
}

function cnFocusBtn(focusing) {
  return (
    "inline-flex h-7 shrink-0 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition-colors " +
    (focusing
      ? "text-primary hover:bg-primary/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted") +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  );
}