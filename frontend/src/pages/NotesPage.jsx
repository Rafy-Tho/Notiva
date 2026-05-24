import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { NoteList } from "../components/note/NoteList";
import { EmptyEditor } from "../components/note/EmptyEditor";
import { useNotes } from "../hooks/useNotes";
import { useMemo } from "react";
export function NotesPage({
  filter,
  title = "All notes",
  emptyTitle,
  emptyHint,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const noteListOpen = useUIStore((s) => s.noteListOpen);
  const toggleNoteList = useUIStore((s) => s.toggleNoteList);
  const notes = useNotes();
  const filteredNotes = useMemo(() => {
    if (filter?.archived) return notes.data?.filter((note) => note.isArchived);
    if (filter?.favorite) return notes.data?.filter((note) => note.isFavorite);
    if (filter?.trashed)
      return notes.data?.filter((note) => note.deletedAt !== null);
    if (filter?.notebookId)
      return notes.data?.filter(
        (note) => note.notebookId === filter.notebookId && !note.deletedAt,
      );
    if (filter?.tagId)
      return notes.data?.filter(
        (note) => note.tagIds.includes(filter.tagId) && !note.deletedAt,
      );
    return notes.data?.filter((note) => !note.deletedAt);
  }, [notes.data, filter]);
  // Compute the list URL by stripping the trailing /:id from the current path.
  const listPath = id
    ? location.pathname.replace(/\/[^/]+$/, "") || "/notes"
    : location.pathname;

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          "border-r border-border flex-col bg-background/40 transition-[width] duration-200 ease-out overflow-hidden",
          // Mobile width: full when shown
          "w-full",
          // Desktop width: collapsible
          noteListOpen ? "md:w-72 md:shrink-0" : "md:w-0 md:border-r-0",
          // On mobile: show the list only when no note is selected.
          id ? "hidden md:flex" : "flex",
        )}
      >
        <div className="h-12 px-3 flex items-center justify-between border-b border-border shrink-0 min-w-[18rem]">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-[10px] text-muted-foreground">
              {filteredNotes?.length}{" "}
              {filteredNotes?.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNoteList}
            className="hidden md:inline-flex h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Hide notes list"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 min-w-[18rem] flex flex-col">
          <NoteList
            notes={filteredNotes}
            loading={notes.isLoading}
            emptyTitle={emptyTitle}
            emptyHint={emptyHint}
          />
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-w-0 flex-col",
          // On mobile: show the editor area only when a note is selected.
          id ? "flex" : "hidden md:flex",
        )}
      >
        {(id || !noteListOpen) && (
          <div className="h-10 px-3 flex items-center gap-2 border-b border-border">
            {!noteListOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNoteList}
                className="hidden md:inline-flex gap-1.5 text-muted-foreground"
                aria-label="Show notes list"
              >
                <PanelLeftOpen className="h-4 w-4" /> Notes
              </Button>
            )}
            {id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(listPath)}
                className="md:hidden gap-1.5 text-muted-foreground"
                aria-label="Back to notes"
              >
                <ArrowLeft className="h-4 w-4" /> Notes
              </Button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {id ? <Outlet /> : <EmptyEditor />}
        </div>
      </div>
    </div>
  );
}
