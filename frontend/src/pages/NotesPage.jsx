import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUIStore } from "../store/useUIStore";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { NoteList } from "../components/note/NoteList";
import { EmptyEditor } from "../components/note/EmptyEditor";
const notes = [
  {
    _id: "6a0e8d785d4880ecd4eabe05",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:36.442Z",
    updatedAt: "2026-05-21T04:43:36.442Z",
    __v: 0,
  },
  {
    _id: "6a0e8d775d4880ecd4eabe04",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:35.160Z",
    updatedAt: "2026-05-21T04:43:35.160Z",
    __v: 0,
  },
  {
    _id: "6a0e8d755d4880ecd4eabe03",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:33.698Z",
    updatedAt: "2026-05-21T04:43:33.698Z",
    __v: 0,
  },
  {
    _id: "6a0e8d745d4880ecd4eabe02",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:32.217Z",
    updatedAt: "2026-05-21T04:43:32.217Z",
    __v: 0,
  },
  {
    _id: "6a0e8d665d4880ecd4eabe01",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:18.816Z",
    updatedAt: "2026-05-21T04:43:18.816Z",
    __v: 0,
  },
  {
    _id: "6a0e8d655d4880ecd4eabe00",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:17.195Z",
    updatedAt: "2026-05-21T04:43:17.195Z",
    __v: 0,
  },
  {
    _id: "6a0e8d625d4880ecd4eabdff",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:14.720Z",
    updatedAt: "2026-05-21T04:43:14.720Z",
    __v: 0,
  },
  {
    _id: "6a0e8d605d4880ecd4eabdfe",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:43:12.893Z",
    updatedAt: "2026-05-21T04:43:12.893Z",
    __v: 0,
  },
  {
    _id: "6a0e8d2eca06a82a9b9f855f",
    title: "Untitled",
    content: "",
    userId: "6a025d1dcddce45a7148c1ab",
    notebookId: null,
    tags: [],
    isPinned: false,
    isFavourite: false,
    isArchived: false,
    wordCound: 0,
    deletedAt: null,
    createdAt: "2026-05-21T04:42:22.677Z",
    updatedAt: "2026-05-21T04:42:22.677Z",
    __v: 0,
  },
];
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
              {notes.length} {notes.length === 1 ? "note" : "notes"}
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
            notes={notes}
            loading={false}
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
