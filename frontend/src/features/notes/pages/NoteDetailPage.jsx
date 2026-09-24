import {
  Archive,
  BookOpen,
  Check,
  MoreHorizontal,
  Pin,
  RotateCcw,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditor } from "../components/NoteEditor";
import { SaveBadge } from "../components/SaveBadge";
import { NoteStatusBar } from "../components/NoteStatusBar";
import { useAutoSave } from "@/hooks/useAutosave";
import { useCreateNoteContext } from "@/hooks/useCreateNoteContext";
import { useUIStore } from "@/store/useUIStore";
import { useNotebooks } from "@/features/notebooks/hooks/useNotebooks";
import {
  useNote,
  usePurge,
  useRemove,
  useRestore,
  useToggleArchive,
  useToggleFavorite,
  useTogglePin,
  useUpdateNote,
} from "../hooks/useNotes";
import { useTags } from "@/features/tags/hooks/useTags";
import { useNoteActions } from "../hooks/useNoteActions";
import { readingTime, wordCount } from "@/lib/sanitize";
import { format, formatDistanceToNow } from "date-fns";
function NoteDetailPage() {
  const { id } = useParams();
  const { data: note, isLoading: noteLoading, error: noteError } = useNote(id);
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: notebooks, isLoading: notebooksLoading } = useNotebooks();
  const navigate = useNavigate();

  if (!id) return null;

  if (noteLoading || tagsLoading || notebooksLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full">
        <div className="h-7 rounded-md bg-muted animate-pulse w-36" />
        <div className="space-y-3 pt-8">
          <Skeleton className="h-9 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (noteError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Failed to load note</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {noteError.message || "Unable to fetch this note."}
        </p>
        <Button onClick={() => navigate("/notes")}>Back to notes</Button>
      </div>
    );
  }

  return (
    <NoteDetailEditor
      id={id}
      note={note}
      tags={tags}
      notebooks={notebooks}
      navigate={navigate}
    />
  );
}

function NoteDetailEditor({ id, note, tags, notebooks, navigate }) {
  const [draft, setDraft] = useState({
    title: note.title ?? "",
    content: note.content ?? "",
  });
  const [isLeaving, setIsLeaving] = useState(false);
  const selectNotebook = note.notebookId ?? "__none__";
  const selectTags = useMemo(() => note.tagIds ?? [], [note.tagIds]);

  const path = useCreateNoteContext();
  const editorRef = useRef(null);

  const focusMode = useUIStore((s) => s.focusMode);
  const setFocusMode = useUIStore((s) => s.setFocusMode);

  const { mutateAsync: updateNote, isPending: isUpdating } = useUpdateNote(id);
  const { mutateAsync: togglePin, isPending: isPinning } = useTogglePin(id);
  const { mutateAsync: toggleFav, isPending: isFavoriting } =
    useToggleFavorite(id);
  const { mutateAsync: toggleArchive, isPending: isArchiving } =
    useToggleArchive(id);
  const { mutateAsync: remove, isPending: isRemoving } = useRemove(id);
  const { mutateAsync: restore, isPending: isRestoring } = useRestore(id);
  const { mutateAsync: purge, isPending: isPurging } = usePurge(id);

  const actionPending =
    isUpdating ||
    isPinning ||
    isFavoriting ||
    isArchiving ||
    isRemoving ||
    isRestoring ||
    isPurging;

  const serverUpdatedAtRef = useRef(note.updatedAt ?? null);

  const saveDraft = useCallback(
    ({ signal, keepalive, expectedUpdatedAt, ...data }) =>
      updateNote({
        ...data,
        signal,
        keepalive,
        expectedUpdatedAt,
      }),
    [updateNote],
  );

  const handleDraftSaved = useCallback((savedNote) => {
    if (savedNote?.updatedAt) {
      serverUpdatedAtRef.current = savedNote.updatedAt;
    }
  }, []);

  const {
    status,
    error: saveError,
    lastSaved,
    saveNow,
    flush,
    isDirty,
    localDraft,
    restoreLocalDraft,
    discardLocalDraft,
    setServerUpdatedAt,
  } = useAutoSave(draft, saveDraft, {
    debounceMs: 1000,
    localKey: `note_draft_${id}`,
    serverUpdatedAt: note.updatedAt,
    onSaved: handleDraftSaved,
  });

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    setFocusMode(false);
  }, [id, setFocusMode]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setFocusMode(!focusMode);
      } else if (e.key === "Escape" && focusMode) {
        e.preventDefault();
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, setFocusMode]);

  const handleTitleBlur = useCallback(() => {
    void flush();
  }, [flush]);

  const wc = useMemo(() => {
    return wordCount(draft.content);
  }, [draft.content]);

  const ensureDraftSaved = useCallback(async () => {
    const saved = await flush();
    if (saved) return;
    throw new Error("Save the latest changes before updating this note");
  }, [flush]);

  const saveMetadata = useCallback(
    async (patch) => {
      await ensureDraftSaved();
      const result = await updateNote({
        ...patch,
        expectedUpdatedAt: serverUpdatedAtRef.current,
      });

      if (result?.updatedAt) {
        serverUpdatedAtRef.current = result.updatedAt;
        setServerUpdatedAt(result.updatedAt);
      }

      return result;
    },
    [ensureDraftSaved, setServerUpdatedAt, updateNote],
  );

  const {
    handleNotebook,
    handleTags,
    handleTogglePin,
    handleToggleFav,
    handleToggleArchive,
    handleTrash,
    handleRestore,
    handlePurge,
  } = useNoteActions({
    saveMetadata,
    togglePin: () => togglePin(),
    toggleFavorite: () => toggleFav(),
    toggleArchive: () => toggleArchive(),
    remove: () => remove(),
    restore: () => restore(),
    purge: () => purge(),
    navigate,
    basePath: path.basePath,
  });

  const toggleTag = useCallback(
    async (tagId) => {
      const exists = selectTags.includes(tagId);
      const next = exists
        ? selectTags.filter((id) => id !== tagId)
        : [...selectTags, tagId];
      void handleTags(next);
    },
    [selectTags, handleTags],
  );

  const handleSaveAndLeave = useCallback(async () => {
    setIsLeaving(true);
    const saved = await flush();
    setIsLeaving(false);

    if (saved) {
      blocker.proceed();
    } else {
      toast.error(saveError?.message ?? "The note could not be saved");
    }
  }, [flush, blocker, saveError]);

  const handleRestoreDraft = useCallback(() => {
    const restored = restoreLocalDraft();
    if (restored) {
      setDraft(restored);
      toast.success("Unsaved draft restored");
    }
  }, [restoreLocalDraft]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0">
        {localDraft && (
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
                  onClick={handleRestoreDraft}
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px]"
                  onClick={discardLocalDraft}
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}
        {note?.deletedAt && (
          <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-4 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5" />
                This note is in Trash. Restore it to keep editing.
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-[11px]"
                  onClick={handleRestore}
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-[11px] text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Delete forever
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete note permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{note.title || "Untitled"}
                        " and all of its version history. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handlePurge}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {!focusMode && (
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 px-4 sm:px-6 md:px-10 lg:px-12 pt-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <SaveBadge
              status={actionPending ? "updating" : status}
              lastSavedAt={lastSaved}
              isDirty={isDirty}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px]"
              onClick={saveNow}
              disabled={actionPending || status === "saving"}
            >
              <Check className="h-3 w-3" /> Save
            </Button>
            {status === "conflict" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px]"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            <Select
              value={selectNotebook ?? "__none__"}
              disabled={actionPending}
              onValueChange={(v) => handleNotebook(v)}
            >
              <SelectTrigger className="h-7 gap-1.5 px-2 text-[11px] border-border bg-transparent hover:bg-muted/40 w-auto min-w-0 shrink-0">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="No notebook" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="__none__">No notebook</SelectItem>
                {notebooks?.map((nb) => (
                  <SelectItem key={nb.id} value={nb.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: `hsl(${nb.color})` }}
                      />
                      {nb.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionPending}
                  className="h-7 gap-1.5 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40 shrink-0"
                >
                  <TagIcon className="h-3 w-3 text-muted-foreground" />
                  {selectTags.length === 0 ? (
                    <span className="text-muted-foreground">No tags</span>
                  ) : (
                    <span>
                      {selectTags.length} tag
                      {selectTags.length === 1 ? "" : "s"}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60 p-2">
                <div className="flex items-center justify-between px-1 pb-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Tags
                  </span>
                  {selectTags.length > 0 && (
                    <button
                      onClick={() => handleTags([])}
                      disabled={actionPending}
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                {tags?.length === 0 ? (
                  <div className="px-2 py-3 text-[11px] text-muted-foreground">
                    No tags yet. Create one from the sidebar.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {tags?.map((t) => {
                      const selected = selectTags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          disabled={actionPending}
                          onClick={() => toggleTag(t.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: `hsl(${t.color})` }}
                            />
                            <span className="truncate">{t.name}</span>
                          </span>
                          {selected && (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePin}
              disabled={actionPending}
              className="h-7 w-7 shrink-0"
              aria-label="Pin"
            >
              <Pin
                className={`h-3.5 w-3.5 ${note?.isPinned ? "fill-primary text-primary" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFav}
              disabled={actionPending}
              className="h-7 w-7 shrink-0"
              aria-label="Favorite"
            >
              <Star
                className={`h-3.5 w-3.5 ${note?.isFavorite ? "fill-warning text-warning" : ""}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleToggleArchive}
                  disabled={actionPending}
                >
                  <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleTrash}
                  disabled={actionPending}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        )}

        <div
          className={`px-4 sm:px-6 md:px-10 lg:px-12 pb-0 max-w-3xl mx-auto w-full ${
            focusMode ? "pt-10" : "pt-2"
          }`}
        >
          <input
            value={draft.title}
            onChange={(e) =>
              setDraft((previous) => ({ ...previous, title: e.target.value }))
            }
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                editorRef.current?.commands.focus("end");
              }
            }}
            placeholder="Untitled"
            className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
          />
          {note && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>
                Edited{" "}
                {formatDistanceToNow(new Date(note.updatedAt), {
                  addSuffix: true,
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Created{" "}
                {format(new Date(note.createdAt), "MMM d, yyyy")}
              </span>
              <span aria-hidden="true">·</span>
              <span>{readingTime(wc)}</span>
            </div>
          )}
          {selectTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectTags.map((tid) => {
                const t = tags.find((x) => x.id === tid);
                if (!t) return null;
                return (
                  <Badge
                    key={t.id}
                    variant="secondary"
                    className="gap-1 pl-1.5 pr-1 py-0.5 text-[10px] font-normal"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: `hsl(${t.color})` }}
                    />
                    {t.name}
                    <button
                      onClick={() => {
                        handleTags(selectTags.filter((id) => id !== t.id));
                      }}
                      className="ml-0.5 rounded-sm hover:bg-background/60 p-0.5"
                      aria-label={`Remove ${t.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-2 pb-0 max-w-3xl mx-auto w-full">
        <NoteEditor
          content={draft.content}
          onChange={(value) =>
            setDraft((previous) => ({ ...previous, content: value }))
          }
          onCmdS={saveNow}
          editorRef={editorRef}
          showToolbar={!focusMode}
        />
      </div>
      <NoteStatusBar
        content={draft.content}
        focusing={focusMode}
        onToggleFocus={() => setFocusMode(!focusMode)}
        status={status}
        isDirty={isDirty}
        lastSavedAt={lastSaved}
        actionPending={actionPending}
      />

      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open) blocker.reset();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset()}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLeaving}
              onClick={(event) => {
                event.preventDefault();
                void handleSaveAndLeave();
              }}
            >
              {isLeaving ? "Saving..." : "Save and leave"}
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-muted text-foreground hover:bg-muted/80"
              onClick={(event) => {
                event.preventDefault();
                blocker.proceed();
              }}
            >
              Leave without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default NoteDetailPage;
