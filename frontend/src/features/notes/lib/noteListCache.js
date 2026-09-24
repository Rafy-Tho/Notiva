import { htmlToText } from "@/lib/sanitize";

const META_FIELDS = [
  "notebookId",
  "tagIds",
  "isPinned",
  "isFavorite",
  "isArchived",
  "deletedAt",
  "title",
  "updatedAt",
  "wordCount",
];

export function matchesListFilters(note, params = {}) {
  if (params.trashed) return Boolean(note?.deletedAt);
  if (note?.deletedAt) return false;
  if (params.isArchived) return note?.isArchived === true;
  if (params.isFavorite) return note?.isFavorite === true;
  if (params.isPinned) return note?.isPinned === true;
  if (params.notebookId) return note?.notebookId === params.notebookId;
  if (params.tagId) return (note?.tagIds ?? []).includes(params.tagId);
  return true;
}

export function canEvaluateMembership(params = {}) {
  return !params.search && !params.dateFilter && !params.from && !params.to;
}

function defaultOrdered(params = {}) {
  return canEvaluateMembership(params) && params.sort !== "title";
}

function getNotesParams(queryKey) {
  if (!Array.isArray(queryKey) || queryKey[0] !== "notes") return undefined;
  const [second, third] = queryKey.slice(1);
  if (second === "infinite") {
    return third && typeof third === "object" ? third : undefined;
  }
  return second && typeof second === "object" ? second : undefined;
}

function pickMeta(patch) {
  const meta = {};
  for (const field of META_FIELDS) {
    if (Object.hasOwn(patch, field)) meta[field] = patch[field];
  }
  if (Object.hasOwn(patch, "content")) {
    meta.contentPreview = htmlToText(patch.content || "").slice(0, 50);
  }
  return meta;
}

function shouldHoist(meta, params) {
  return Boolean(
    defaultOrdered(params) && (meta.isPinned === true || meta.updatedAt),
  );
}

export function patchNoteInLists(queryClient, noteId, patch) {
  const meta = pickMeta(patch);
  if (Object.keys(meta).length === 0) return;

  const fullNote = queryClient.getQueryData(["note", noteId]);
  const base = fullNote ? { ...fullNote } : null;
  if (base && Object.hasOwn(base, "content")) delete base.content;

  const queries = queryClient.getQueryCache().getAll();

  for (const query of queries) {
    const { queryKey: qk, state } = query;
    const params = getNotesParams(qk);
    const data = state?.data;
    if (!params || !data) continue;

    if (qk[1] === "infinite") {
      if (!Array.isArray(data.pages)) continue;
      let { pages, delta } = data.pages.reduce(
        (acc, page, index) => {
          const { page: nextPage, delta } = processPage(
            page,
            noteId,
            meta,
            base,
            params,
            index,
          );
          acc.pages.push(nextPage);
          acc.delta += delta;
          return acc;
        },
        { pages: [], delta: 0 },
      );
      if (shouldHoist(meta, params)) {
        pages = hoistToTop(pages, noteId);
      }
      const nextPages =
        delta === 0
          ? pages
          : pages.map((page) =>
              page && typeof page.total === "number"
                ? { ...page, total: Math.max(0, page.total + delta) }
                : page,
            );
      queryClient.setQueryData(qk, { ...data, pages: nextPages });
      continue;
    }

    let { page, delta } = processPage(data, noteId, meta, base, params, 0);
    if (shouldHoist(meta, params) && page?.notes) {
      const notes = hoistNote(page.notes, noteId);
      if (notes) page = { ...page, notes };
    }
    queryClient.setQueryData(
      qk,
      delta !== 0 && typeof page?.total === "number"
        ? { ...page, total: Math.max(0, page.total + delta) }
        : page,
    );
  }
}

export function insertNoteIntoLists(queryClient, note) {
  if (!note?.id) return;
  const queries = queryClient.getQueryCache().getAll();

  for (const query of queries) {
    const { queryKey: qk, state } = query;
    const params = getNotesParams(qk);
    const data = state?.data;
    if (!params || !data || !canEvaluateMembership(params)) continue;
    if (!matchesListFilters(note, params)) continue;

    if (qk[1] === "infinite") {
      if (!Array.isArray(data.pages) || data.pages.length === 0) continue;
      const first = data.pages[0];
      if (!first || !Array.isArray(first.notes)) continue;
      if (first.notes.some((n) => n?.id === note.id)) continue;
      const pages = [
        {
          ...first,
          notes: [note, ...first.notes],
          total: (first.total ?? 0) + 1,
        },
        ...data.pages.slice(1).map((page) =>
          page && typeof page.total === "number"
            ? { ...page, total: page.total + 1 }
            : page,
        ),
      ];
      queryClient.setQueryData(qk, { ...data, pages });
      continue;
    }

    if (!Array.isArray(data.notes) || data.notes.some((n) => n?.id === note.id)) {
      continue;
    }
    queryClient.setQueryData(qk, {
      ...data,
      notes: [note, ...data.notes],
      total: (data.total ?? 0) + 1,
    });
  }
}

export function removeNoteFromAllLists(queryClient, noteId) {
  const queries = queryClient.getQueryCache().getAll();

  for (const query of queries) {
    const { queryKey: qk, state } = query;
    const data = state?.data;
    if (!Array.isArray(qk) || qk[0] !== "notes" || !data) continue;

    if (qk[1] === "infinite") {
      if (!Array.isArray(data.pages)) continue;
      let removed = false;
      const pages = data.pages.map((page) => {
        if (!page || !Array.isArray(page.notes)) return page;
        const notes = page.notes.filter((n) => n?.id !== noteId);
        if (notes.length !== page.notes.length) removed = true;
        return { ...page, notes };
      });
      if (!removed) continue;
      queryClient.setQueryData(
        qk,
        {
          ...data,
          pages: pages.map((page) =>
            page && typeof page.total === "number"
              ? { ...page, total: Math.max(0, page.total - 1) }
              : page,
          ),
        },
      );
      continue;
    }

    if (!Array.isArray(data.notes)) continue;
    const notes = data.notes.filter((n) => n?.id !== noteId);
    if (notes.length === data.notes.length) continue;
    queryClient.setQueryData(
      qk,
      typeof data.total === "number"
        ? { ...data, notes, total: Math.max(0, data.total - 1) }
        : { ...data, notes },
    );
  }
}

export function findCachedNote(queryClient, noteId) {
  const queries = queryClient.getQueryCache().getAll();
  for (const query of queries) {
    const { queryKey: qk, state } = query;
    if (!Array.isArray(qk) || qk[0] !== "notes") continue;
    const data = state?.data;
    if (!data) continue;
    if (qk[1] === "infinite") {
      for (const page of data.pages ?? []) {
        const note = page?.notes?.find((n) => n?.id === noteId);
        if (note) return note;
      }
      continue;
    }
    const note = data.notes?.find((n) => n?.id === noteId);
    if (note) return note;
  }
  return undefined;
}

function processPage(page, noteId, meta, base, params, pageIndex) {
  if (!page || !Array.isArray(page.notes)) {
    return { page, delta: 0 };
  }

  const notes = [...page.notes];
  const idx = notes.findIndex((note) => note?.id === noteId);
  let delta = 0;

  if (idx !== -1) {
    const merged = { ...notes[idx], ...meta };
    if (canEvaluateMembership(params) && !matchesListFilters(merged, params)) {
      notes.splice(idx, 1);
      delta = -1;
    } else {
      notes[idx] = merged;
    }
  } else if (
    pageIndex === 0 &&
    base &&
    canEvaluateMembership(params) &&
    matchesListFilters({ ...base, ...meta }, params)
  ) {
    notes.unshift({ ...base, ...meta });
    delta = 1;
  }

  return { page: { ...page, notes }, delta };
}

function hoistToTop(pages, noteId) {
  let foundIndex = -1;
  for (let i = 0; i < pages.length; i += 1) {
    if (pages[i]?.notes?.some((note) => note?.id === noteId)) {
      foundIndex = i;
      break;
    }
  }
  if (foundIndex === -1) return pages;

  const page = pages[foundIndex];
  const note = page.notes.find((n) => n?.id === noteId);
  const rest = page.notes.filter((n) => n?.id !== noteId);
  const nextPages = [...pages];
  nextPages[foundIndex] = { ...page, notes: rest };
  const first = nextPages[0];
  if (!first || !Array.isArray(first.notes)) return nextPages;
  nextPages[0] = { ...first, notes: [note, ...first.notes] };
  return nextPages;
}

function hoistNote(notes, noteId) {
  const idx = notes.findIndex((note) => note?.id === noteId);
  if (idx <= 0) return null;
  const [note] = notes.splice(idx, 1);
  notes.unshift(note);
  return notes;
}

export function snapshotNotesLists(queryClient) {
  return queryClient
    .getQueryCache()
    .getAll()
    .filter((query) => Array.isArray(query.queryKey) && query.queryKey[0] === "notes")
    .map((query) => ({
      queryKey: query.queryKey,
      data: query.state.data,
    }));
}

export function restoreNotesLists(queryClient, snapshot) {
  if (!snapshot) return;
  for (const { queryKey, data } of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}