import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function SaveBadge({ status, lastSavedAt, isDirty }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);
  if (status === "updating") {
    return (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Updating…
      </span>
    );
  }

  if (status === "saving") {
    return (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="text-[11px] text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Save failed
      </span>
    );
  }

  if (status === "conflict") {
    return (
      <span className="text-[11px] text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Conflict - reload required
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="text-[11px] text-warning flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Unsaved
      </span>
    );
  }

  if (status === "saved" || lastSavedAt) {
    return (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-success" /> Saved{" "}
        {lastSavedAt ? `· ${timeAgo(lastSavedAt, now)}` : ""}
      </span>
    );
  }

  return <span className="text-[11px] text-muted-foreground">Draft</span>;
}

function timeAgo(d, now = Date.now()) {
  const sec = Math.round((now - d.getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.round(sec / 60)}m ago`;
}
