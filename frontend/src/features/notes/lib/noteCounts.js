export function noteCountsDelta(prevNote = null, nextNote = null) {
  const prev = prevNote ?? null;
  const next = nextNote ?? {};
  const prevActive = prev !== null && !prev.deletedAt;
  const nextActive = !next.deletedAt;

  const deltas = {
    all: (nextActive ? 1 : 0) - (prevActive ? 1 : 0),
    favorites:
      (nextActive && next.isFavorite ? 1 : 0) -
      (prevActive && prev.isFavorite ? 1 : 0),
    archive:
      (nextActive && next.isArchived ? 1 : 0) -
      (prevActive && prev.isArchived ? 1 : 0),
    trash: (next.deletedAt ? 1 : 0) - (prev?.deletedAt ? 1 : 0),
    notebooks: {},
    tags: {},
  };

  const prevNotebook = prevActive ? prev.notebookId : null;
  const nextNotebook = nextActive ? next.notebookId : null;
  if (prevNotebook !== nextNotebook) {
    if (prevNotebook) deltas.notebooks[prevNotebook] = -1;
    if (nextNotebook) deltas.notebooks[nextNotebook] = 1;
  }

  const prevTags = new Set(prevActive ? prev.tagIds ?? [] : []);
  const nextTags = nextActive ? next.tagIds ?? [] : [];
  for (const tagId of nextTags) {
    if (!prevTags.has(tagId)) deltas.tags[tagId] = (deltas.tags[tagId] ?? 0) + 1;
  }
  for (const tagId of prevTags) {
    if (!nextTags.includes(tagId)) deltas.tags[tagId] = (deltas.tags[tagId] ?? 0) - 1;
  }

  return deltas;
}

export function notePurgeDelta(prevNote = {}) {
  return {
    all: 0,
    favorites: 0,
    archive: 0,
    trash: prevNote?.deletedAt ? -1 : 0,
    notebooks: {},
    tags: {},
  };
}

export function applyCountsToState(state, deltas = {}) {
  const clamp = (value) => Math.max(0, value);
  const adjustRows = (rows, changes) => {
    const nextRows = [...(rows ?? [])];
    for (const [id, delta] of Object.entries(changes ?? {})) {
      const idx = nextRows.findIndex((row) => row?.id === id);
      if (idx === -1) {
        if (delta > 0) nextRows.push({ id, count: delta });
        continue;
      }
      const count = clamp((nextRows[idx].count ?? 0) + delta);
      if (count > 0) {
        nextRows[idx] = { ...nextRows[idx], count };
      } else {
        nextRows.splice(idx, 1);
      }
    }
    return nextRows;
  };

  return {
    ...state,
    all: clamp((state.all ?? 0) + (deltas.all ?? 0)),
    favorites: clamp((state.favorites ?? 0) + (deltas.favorites ?? 0)),
    archive: clamp((state.archive ?? 0) + (deltas.archive ?? 0)),
    trash: clamp((state.trash ?? 0) + (deltas.trash ?? 0)),
    notebooks: adjustRows(state.notebooks, deltas.notebooks),
    tags: adjustRows(state.tags, deltas.tags),
  };
}