import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Pin, RotateCcw, Star, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { htmlToText } from "../../lib/sanitize";
import { cn } from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function NoteCard({ note, active, onClick }) {
  const preview = htmlToText(note.content).slice(0, 140);
  const { id: openId } = useParams();
  const location = useLocation();
  const warned = useRef(false);

  // Days remaining before trash auto-purge
  const daysLeft =
    note.isDeleted && note.deletedAt
      ? Math.max(
          0,
          30 -
            Math.floor(
              (Date.now() - new Date(note.deletedAt).getTime()) /
                (24 * 3600 * 1000),
            ),
        )
      : null;

  useEffect(() => {
    if (daysLeft !== null && daysLeft <= 3 && !warned.current) {
      warned.current = true;
      toast.warning(
        `"${note.title || "Untitled"}" will be permanently deleted in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        {
          id: `purge-warn-${note.id}`,
        },
      );
    }
  }, [daysLeft, note.id, note.title]);

  // Derive the section base path so opening a note keeps the user in the
  // current section (trash, archive, favorites, notebooks, tags) instead of
  // jumping to /notes/:id.
  const getBasePath = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "/notes";
    const first = segments[0];
    if (first === "notebooks" || first === "tags") {
      // /notebooks/:notebookId or /tags/:tagId — keep first two segments
      return segments.length >= 2
        ? `/${segments[0]}/${segments[1]}`
        : `/${first}`;
    }
    if (["favorites", "archive", "trash", "notes"].includes(first)) {
      return `/${first}`;
    }
    return "/notes";
  };
  const to = `${getBasePath()}/${note.id}`;

  const restore = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const deleteForever = async () => {};

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
            {daysLeft !== null && (
              <>
                <span>·</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    daysLeft <= 3 ? "text-destructive" : "",
                  )}
                >
                  {daysLeft <= 3 && <AlertTriangle className="h-2.5 w-2.5" />}
                  {daysLeft === 0 ? "purges today" : `${daysLeft}d left`}
                </span>
              </>
            )}
          </div>
          {note.isDeleted && (
            <div className="flex items-center gap-1.5 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] gap-1"
                onClick={restore}
              >
                <RotateCcw className="h-3 w-3" /> Restore
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete note permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{note.title || "Untitled"}"
                      and all of its version history. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteForever}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
