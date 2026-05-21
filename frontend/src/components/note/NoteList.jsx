import { FileQuestion } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function NoteList({
  notes,
  loading,
  emptyTitle = "No notes",
  emptyHint = "Create your first note with ⌘N",
}) {
  if (loading) {
    return (
      <div className="p-3 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="h-full grid place-items-center p-6 text-center">
        <div className="space-y-2 max-w-xs">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-items-center">
            <FileQuestion className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-medium">{emptyTitle}</h3>
          <p className="text-xs text-muted-foreground">{emptyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {/* {notes.map((n) => (
        <NoteCard key={n.id} note={n} active={n.id === id} />
      ))} */}
    </div>
  );
}
