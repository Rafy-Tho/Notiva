import { useState, useMemo } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { NoteList } from "../components/note/NoteList";
import { EmptyEditor } from "../components/note/EmptyEditor";
import { useNotesInfinite } from "../hooks/useNotes";
import { useDebounce } from "../hooks/useDebounce";
import { DateFilter } from "../components/search/DateFilter";

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

  const [searchInput, setSearchInput] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);

  const queryParams = useMemo(() => {
    const p = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (dateFilter) p.dateFilter = dateFilter;
    if (filter?.archived) p.isArchived = true;
    if (filter?.favorite) p.isFavorite = true;
    if (filter?.trashed) p.trashed = true;
    if (filter?.notebookId) p.notebookId = filter.notebookId;
    if (filter?.tagId) p.tagId = filter.tagId;
    return p;
  }, [debouncedSearch, dateFilter, filter]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotesInfinite(queryParams);

  const notes = useMemo(
    () => data?.pages.flatMap((p) => p.notes) ?? [],
    [data],
  );

  const totalNotes = data?.pages[0]?.total ?? 0;

  const listPath = id
    ? location.pathname.replace(/\/[^/]+$/, "") || "/notes"
    : location.pathname;

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          "border-r border-border flex-col bg-background/40 transition-[width] duration-200 ease-out overflow-hidden",
          "w-full",
          noteListOpen ? "md:w-72 md:shrink-0" : "md:w-0 md:border-r-0",
          id ? "hidden md:flex" : "flex",
        )}
      >
        <div className="h-12 px-3 flex items-center justify-between border-b border-border shrink-0 min-w-[18rem]">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-[10px] text-muted-foreground">
              {totalNotes} {totalNotes === 1 ? "note" : "notes"}
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

        <div className="px-3 py-2 space-y-2 border-b border-border shrink-0 min-w-[18rem]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search notes…"
              className="h-8 pl-7 pr-7 text-xs"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <DateFilter value={dateFilter} onChange={setDateFilter} />
        </div>

        <div className="flex-1 min-h-0 min-w-[18rem] flex flex-col">
          <NoteList
            notes={notes}
            loading={isLoading}
            emptyTitle={emptyTitle}
            emptyHint={emptyHint}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-w-0 flex-col",
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
