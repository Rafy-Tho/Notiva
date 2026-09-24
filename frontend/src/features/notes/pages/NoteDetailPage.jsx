import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { NoteEditor } from "../components/NoteEditor";
import { NoteStatusBar } from "../components/NoteStatusBar";
import { DraftBanner } from "../components/DraftBanner";
import { TrashBanner } from "../components/TrashBanner";
import { NoteToolbar } from "../components/NoteToolbar";
import { UnsavedDialog } from "../components/UnsavedDialog";
import { useNoteEditing } from "../hooks/useNoteEditing";
import { useNote } from "../hooks/useNotes";
import { useUIStore } from "@/store/useUIStore";
import { useNotebooks } from "@/features/notebooks/hooks/useNotebooks";
import { useTags } from "@/features/tags/hooks/useTags";
import { readingTime } from "@/lib/sanitize";
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
      <ErrorState
        title="Failed to load note"
        message={noteError.message || "Unable to fetch this note."}
        actionLabel="Back to notes"
        onAction={() => navigate("/notes")}
      />
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
  const {
    draft,
    setDraftTitle,
    setDraftContent,
    editorRef,
    focusMode,
    selectNotebook,
    selectTags,
    toggleTag,
    handleNotebook,
    handleTags,
    handleTogglePin,
    handleToggleFav,
    handleToggleArchive,
    handleTrash,
    handleRestore,
    handlePurge,
    actionPending,
    status,
    lastSaved,
    saveNow,
    isDirty,
    localDraft,
    discardLocalDraft,
    isLeaving,
    blocker,
    handleSaveAndLeave,
    handleRestoreDraft,
    wc,
    handleTitleBlur,
  } = useNoteEditing({ id, note, navigate });

  const setFocusMode = useUIStore((s) => s.setFocusMode);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0">
        {localDraft && (
          <DraftBanner
            onRestore={handleRestoreDraft}
            onDiscard={discardLocalDraft}
          />
        )}
        {note?.deletedAt && (
          <TrashBanner
            noteTitle={note.title}
            onRestore={handleRestore}
            onPurge={handlePurge}
          />
        )}

        {!focusMode && (
          <NoteToolbar
            status={status}
            lastSavedAt={lastSaved}
            isDirty={isDirty}
            actionPending={actionPending}
            saveNow={saveNow}
            selectNotebook={selectNotebook}
            handleNotebook={handleNotebook}
            notebooks={notebooks}
            selectTags={selectTags}
            handleTags={handleTags}
            tags={tags}
            toggleTag={toggleTag}
            isPinned={note?.isPinned}
            handleTogglePin={handleTogglePin}
            isFavorite={note?.isFavorite}
            handleToggleFav={handleToggleFav}
            handleToggleArchive={handleToggleArchive}
            handleTrash={handleTrash}
          />
        )}

        <div
          className={`px-4 sm:px-6 md:px-10 lg:px-12 pb-0 max-w-3xl mx-auto w-full ${
            focusMode ? "pt-10" : "pt-2"
          }`}
        >
          <input
            value={draft.title}
            onChange={(e) => setDraftTitle(e.target.value)}
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
                Created {format(new Date(note.createdAt), "MMM d, yyyy")}
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
          onChange={setDraftContent}
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
        words={wc}
      />

      <UnsavedDialog
        blocked={blocker.state === "blocked"}
        isLeaving={isLeaving}
        onClose={() => blocker.reset()}
        onSaveAndLeave={handleSaveAndLeave}
        onProceed={() => blocker.proceed()}
      />
    </div>
  );
}

export default NoteDetailPage;