import { useCallback, useRef } from "react";
import { toast } from "sonner";

export function useNoteActions({
  saveMetadata,
  togglePin,
  toggleFavorite,
  toggleArchive,
  remove,
  restore,
  purge,
  navigate,
  basePath,
}) {
  const serverUpdatedAtRef = useRef(null);
  const setServerUpdatedAt = useCallback((value) => {
    serverUpdatedAtRef.current = value;
  }, []);

  const handleIcon = useCallback(
    async (emoji, currentCover) => {
      const previous = currentCover?.emoji;
      try {
        await saveMetadata({ cover: { emoji, color: currentCover?.color } });
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false, previous };
      }
    },
    [saveMetadata],
  );

  const handleCover = useCallback(
    async (color, currentCover) => {
      const previous = currentCover?.color;
      try {
        await saveMetadata({ cover: { color, emoji: currentCover?.emoji } });
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false, previous };
      }
    },
    [saveMetadata],
  );

  const handleNotebook = useCallback(
    async (notebookId) => {
      const normalizedNotebookId = notebookId === "__none__" ? null : notebookId;
      try {
        await saveMetadata({ notebookId: normalizedNotebookId });
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [saveMetadata],
  );

  const handleTags = useCallback(
    async (tagIds) => {
      try {
        await saveMetadata({ tagIds });
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [saveMetadata],
  );

  const handleTogglePin = useCallback(
    async () => {
      try {
        const result = await togglePin();
        if (result?.updatedAt) {
          serverUpdatedAtRef.current = result.updatedAt;
          setServerUpdatedAt(result.updatedAt);
        }
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [togglePin, setServerUpdatedAt],
  );

  const handleToggleFav = useCallback(
    async () => {
      try {
        const result = await toggleFavorite();
        if (result?.updatedAt) {
          serverUpdatedAtRef.current = result.updatedAt;
          setServerUpdatedAt(result.updatedAt);
        }
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [toggleFavorite, setServerUpdatedAt],
  );

  const handleToggleArchive = useCallback(
    async () => {
      try {
        const result = await toggleArchive();
        if (result?.updatedAt) {
          serverUpdatedAtRef.current = result.updatedAt;
          setServerUpdatedAt(result.updatedAt);
        }
        if (result?.isArchived) navigate("/archive");
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [toggleArchive, navigate, setServerUpdatedAt],
  );

  const handleTrash = useCallback(
    async () => {
      try {
        await remove();
        navigate(basePath);
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [remove, navigate, basePath],
  );

  const handleRestore = useCallback(
    async () => {
      try {
        await restore();
        navigate(basePath);
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [restore, navigate, basePath],
  );

  const handlePurge = useCallback(
    async () => {
      try {
        await purge();
        navigate("/trash");
        return { success: true };
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [purge, navigate],
  );

  return {
    serverUpdatedAtRef,
    setServerUpdatedAt,
    handleIcon,
    handleCover,
    handleNotebook,
    handleTags,
    handleTogglePin,
    handleToggleFav,
    handleToggleArchive,
    handleTrash,
    handleRestore,
    handlePurge,
  };
}
