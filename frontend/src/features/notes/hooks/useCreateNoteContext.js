import { useLocation } from "react-router-dom";

export function useCreateNoteContext() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const first = segments[0];

  const defaults = {
    notebookId: undefined,
    tagIds: undefined,
    isFavorite: undefined,
  };

  let basePath = "/notes";

  if (first === "notebooks" && segments[1]) {
    defaults.notebookId = segments[1];
    basePath = `/notebooks/${segments[1]}`;
  } else if (first === "tags" && segments[1]) {
    defaults.tagIds = [segments[1]];
    basePath = `/tags/${segments[1]}`;
  } else if (first === "favorites") {
    defaults.isFavorite = true;
    basePath = "/favorites";
  } else if (first === "archive" || first === "trash") {
    // Don't create archived/trashed notes — fall back to All notes.
    basePath = "/notes";
  }

  return { defaults, basePath };
}
