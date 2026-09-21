import { formatDistanceToNow } from "date-fns";
import { Pin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { htmlToText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

export const NoteCard = ({ note, active, onClick, basePath = "/notes" }) => {
  const preview =
    note.contentPreview || htmlToText(note.content || "").slice(0, 100);
  const to = `${basePath}/${note.id}`;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "group block px-3 py-3 border-b border-border hover:bg-muted/40 transition-colors select-none",
        active && "bg-muted/60",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {note.isPinned && (
              <Pin className="h-3 w-3 text-primary fill-primary" />
            )}
            {note.isFavorite && (
              <Star className="h-3 w-3 text-warning fill-warning" />
            )}
            {note.cover?.emoji && (
              <span className="text-xs leading-none">{note.cover.emoji}</span>
            )}
            <h3 className="text-sm font-medium truncate">
              {note.title || "Untitled"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
            {preview || "No content"}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
              })}
            </span>
            <span>·</span>
            <span>{note.wordCount} words</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
