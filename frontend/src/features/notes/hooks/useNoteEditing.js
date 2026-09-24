import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutosave";
import { useCreateNoteContext } from "./useCreateNoteContext";
import { useUIStore } from "@/store/useUIStore";
import { useNoteActions } from "./useNoteActions";
import {
  usePurge,
  useRemove,
  useRestore,
  useToggleArchive,
  useToggleFavorite,
  useTogglePin,
  useUpdateNote,
} from "./useNotes";
import { wordCount } from "@/lib/sanitize";

export function useNoteEditing({ id, note, navigate }) {
  const [draft, setDraft] = useState({
    title: note.title ?? "",
    content: note.content ?? "",
  });
  const [isLeaving, setIsLeaving] = useState(false);
  const selectNotebook = note.notebookId ?? "__none__";
  const selectTags = useMemo(() => note.tagIds ?? [], [note.tagIds]);

  const { basePath } = useCreateNoteContext();
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
    basePath,
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

  const setDraftTitle = useCallback(
    (title) => setDraft((previous) => ({ ...previous, title })),
    [],
  );

  const setDraftContent = useCallback(
    (content) => setDraft((previous) => ({ ...previous, content })),
    [],
  );

  return {
    draft,
    setDraftTitle,
    setDraftContent,
    editorRef,
    focusMode,
    setFocusMode,
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
    saveError,
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
  };
}