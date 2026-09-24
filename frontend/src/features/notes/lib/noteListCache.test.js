import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  canEvaluateMembership,
  insertNoteIntoLists,
  matchesListFilters,
  patchNoteInLists,
  removeNoteFromAllLists,
  restoreNotesLists,
  snapshotNotesLists,
} from "./noteListCache";

function makeNote(overrides = {}) {
  return {
    id: "note-1",
    title: "My note",
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    notebookId: null,
    tagIds: [],
    updatedAt: "2026-09-24T00:00:00.000Z",
    ...overrides,
  };
}

function newClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("matchesListFilters", () => {
  it("matches the all-notes default for non-trashed notes", () => {
    expect(matchesListFilters(makeNote(), {})).toBe(true);
    expect(matchesListFilters(makeNote({ deletedAt: "x" }), {})).toBe(false);
  });

  it("matches favorites / pinned / archived / notebook / tag filters", () => {
    expect(matchesListFilters(makeNote(), { isFavorite: true })).toBe(false);
    expect(matchesListFilters(makeNote({ isFavorite: true }), { isFavorite: true })).toBe(true);
    expect(matchesListFilters(makeNote({ isPinned: true }), { isPinned: true })).toBe(true);
    expect(matchesListFilters(makeNote(), { isPinned: true })).toBe(false);
    expect(matchesListFilters(makeNote(), { isArchived: true })).toBe(false);
    expect(matchesListFilters(makeNote({ isArchived: true }), { isArchived: true })).toBe(true);
    expect(matchesListFilters(makeNote({ notebookId: "nb-1" }), { notebookId: "nb-1" })).toBe(true);
    expect(matchesListFilters(makeNote({ notebookId: "nb-2" }), { notebookId: "nb-1" })).toBe(false);
    expect(matchesListFilters(makeNote({ tagIds: ["t-1"] }), { tagId: "t-1" })).toBe(true);
    expect(matchesListFilters(makeNote(), { tagId: "t-1" })).toBe(false);
  });

  it("matches the trash filter on deletedAt", () => {
    expect(matchesListFilters(makeNote({ deletedAt: "x" }), { trashed: true })).toBe(true);
    expect(matchesListFilters(makeNote(), { trashed: true })).toBe(false);
  });

  it("cannot evaluate membership when a search/date filter is active", () => {
    expect(canEvaluateMembership({})).toBe(true);
    expect(canEvaluateMembership({ search: "foo" })).toBe(false);
    expect(canEvaluateMembership({ dateFilter: "today" })).toBe(false);
  });
});

describe("patchNoteInLists", () => {
  it("merges metadata into the matching note of a non-infinite list", () => {
    const client = newClient();
    const note = makeNote({ contentPreview: "preview" });
    client.setQueryData(["notes", {}], { notes: [note], total: 1, hasMore: false, page: 1, totalPages: 1 });

    patchNoteInLists(client, "note-1", { isPinned: true });

    const data = client.getQueryData(["notes", {}]);
    expect(data.notes[0].isPinned).toBe(true);
    expect(data.total).toBe(1);
  });

  it("merges metadata across every page of an infinite list", () => {
    const client = newClient();
    const note = makeNote({ id: "note-1" });
    client.setQueryData(["notes", "infinite", {}], {
      pages: [
        { notes: [makeNote({ id: "note-9" }), note], total: 3, page: 1, hasMore: true },
        { notes: [makeNote({ id: "note-2" })], total: 3, page: 2, hasMore: false },
      ],
      pageParams: [1, 2],
    });

    patchNoteInLists(client, "note-1", { isFavorite: true });

    const data = client.getQueryData(["notes", "infinite", {}]);
    expect(data.pages[0].notes.find((n) => n.id === "note-1").isFavorite).toBe(true);
    expect(data.pages[0].total).toBe(3);
  });

  it("removes a note from a favorites list when it is un-favorited", () => {
    const client = newClient();
    const note = makeNote({ isFavorite: true });
    client.setQueryData(["notes", { isFavorite: true }], { notes: [note, makeNote({ id: "note-2", isFavorite: true })], total: 2 });

    patchNoteInLists(client, "note-1", { isFavorite: false });

    const data = client.getQueryData(["notes", { isFavorite: true }]);
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0].id).toBe("note-2");
    expect(data.total).toBe(1);
  });

  it("removes a note from a notebook list when it moves out", () => {
    const client = newClient();
    const note = makeNote({ notebookId: "nb-1" });
    client.setQueryData(["notes", { notebookId: "nb-1" }], { notes: [note], total: 1 });

    patchNoteInLists(client, "note-1", { notebookId: "nb-2" });

    const data = client.getQueryData(["notes", { notebookId: "nb-1" }]);
    expect(data.notes).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it("prepends a note to a filtered list it newly matches using the single-note cache", () => {
    const client = newClient();
    client.setQueryData(["note", "note-1"], makeNote({ title: "Starred now" }));
    client.setQueryData(["notes", { isFavorite: true }], { notes: [makeNote({ id: "note-2", isFavorite: true })], total: 1 });

    patchNoteInLists(client, "note-1", { isFavorite: true });

    const data = client.getQueryData(["notes", { isFavorite: true }]);
    expect(data.notes[0].id).toBe("note-1");
    expect(data.notes[0].title).toBe("Starred now");
    expect(data.total).toBe(2);
  });

  it("only merges (never removes) when membership cannot be evaluated", () => {
    const client = newClient();
    const note = makeNote({ isFavorite: true, contentPreview: "p" });
    client.setQueryData(["notes", { search: "foo" }], { notes: [note], total: 1 });

    patchNoteInLists(client, "note-1", { isFavorite: false });

    const data = client.getQueryData(["notes", { search: "foo" }]);
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0].isFavorite).toBe(false);
    expect(data.total).toBe(1);
  });

  it("updates card display fields from title/content patches without storing content", () => {
    const client = newClient();
    const note = makeNote();
    client.setQueryData(["notes", {}], { notes: [note], total: 1 });

    patchNoteInLists(client, "note-1", {
      content: "<p>Hello world</p>",
      title: "New title",
    });

    const entry = client.getQueryData(["notes", {}]).notes[0];
    expect(entry.title).toBe("New title");
    expect(entry.contentPreview).toBe("Hello world");
    expect(entry).not.toHaveProperty("content");
  });
});

describe("snapshot / restore", () => {
  it("restores the previous list cache state on error", () => {
    const client = newClient();
    const note = makeNote();
    client.setQueryData(["notes", {}], { notes: [note], total: 1 });
    client.setQueryData(["notes", "infinite", {}], { pages: [{ notes: [note], total: 1, page: 1 }], pageParams: [1] });

    const snapshot = snapshotNotesLists(client);

    patchNoteInLists(client, "note-1", { isPinned: true });
    expect(client.getQueryData(["notes", {}]).notes[0].isPinned).toBe(true);

    restoreNotesLists(client, snapshot);
    expect(client.getQueryData(["notes", {}]).notes[0].isPinned).toBe(false);
    expect(client.getQueryData(["notes", "infinite", {}]).pages[0].notes[0].isPinned).toBe(false);
  });
});

describe("pin reorder", () => {
  it("moves a pinned note to the top of a default-ordered list", () => {
    const client = newClient();
    const a = makeNote({ id: "a" });
    const b = makeNote({ id: "b" });
    client.setQueryData(["notes", {}], { notes: [a, b], total: 2 });

    patchNoteInLists(client, "b", { isPinned: true });

    const data = client.getQueryData(["notes", {}]);
    expect(data.notes.map((n) => n.id)).toEqual(["b", "a"]);
    expect(data.notes[0].isPinned).toBe(true);
  });

  it("hoists a pinned note from a later page to the top of page one", () => {
    const client = newClient();
    client.setQueryData(["notes", "infinite", {}], {
      pages: [
        { notes: [makeNote({ id: "a" }), makeNote({ id: "b" })], total: 3, page: 1, hasMore: true },
        { notes: [makeNote({ id: "c" })], total: 3, page: 2, hasMore: false },
      ],
      pageParams: [1, 2],
    });

    patchNoteInLists(client, "c", { isPinned: true });

    const data = client.getQueryData(["notes", "infinite", {}]);
    expect(data.pages[0].notes[0].id).toBe("c");
    expect(data.pages[0].notes).toHaveLength(3);
    expect(data.pages[1].notes.find((n) => n.id === "c")).toBeUndefined();
  });

  it("does not reorder existing pinned notes on unpin", () => {
    const client = newClient();
    const a = makeNote({ id: "a", isPinned: true });
    const b = makeNote({ id: "b", isPinned: true });
    client.setQueryData(["notes", {}], { notes: [a, b], total: 2 });

    patchNoteInLists(client, "b", { isPinned: false });

    expect(client.getQueryData(["notes", {}]).notes.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("hoists an edited note to the top of a default-ordered list when updatedAt changes", () => {
    const client = newClient();
    const a = makeNote({ id: "a" });
    const b = makeNote({ id: "b" });
    client.setQueryData(["notes", {}], { notes: [a, b], total: 2 });

    patchNoteInLists(client, "b", {
      title: "Edited",
      updatedAt: "2026-09-24T09:00:00.000Z",
    });

    const data = client.getQueryData(["notes", {}]);
    expect(data.notes.map((n) => n.id)).toEqual(["b", "a"]);
    expect(data.notes[0].title).toBe("Edited");
  });

  it("does not reorder title-sorted or search/date-filtered lists on updatedAt changes", () => {
    const client = newClient();
    const a = makeNote({ id: "a" });
    const b = makeNote({ id: "b" });
    client.setQueryData(["notes", { sort: "title" }], { notes: [a, b], total: 2 });
    client.setQueryData(["notes", { search: "foo" }], { notes: [a, b], total: 2 });
    client.setQueryData(["notes", { dateFilter: "today" }], { notes: [a, b], total: 2 });

    patchNoteInLists(client, "b", { updatedAt: "2026-09-24T09:00:00.000Z" });

    expect(
      client.getQueryData(["notes", { sort: "title" }]).notes.map((n) => n.id),
    ).toEqual(["a", "b"]);
    expect(
      client.getQueryData(["notes", { search: "foo" }]).notes.map((n) => n.id),
    ).toEqual(["a", "b"]);
    expect(
      client.getQueryData(["notes", { dateFilter: "today" }]).notes.map((n) => n.id),
    ).toEqual(["a", "b"]);
  });
});

describe("trash transitions", () => {
  it("removes a trashed favorite from the favorites list", () => {
    const client = newClient();
    const note = makeNote({ isFavorite: true });
    client.setQueryData(["notes", { isFavorite: true }], { notes: [note, makeNote({ id: "x", isFavorite: true })], total: 2 });

    patchNoteInLists(client, "note-1", { deletedAt: "2026-09-24T10:00:00Z" });

    const data = client.getQueryData(["notes", { isFavorite: true }]);
    expect(data.notes.map((n) => n.id)).toEqual(["x"]);
    expect(data.total).toBe(1);
  });

  it("moves a deleted note out of all-notes and into the trash list", () => {
    const client = newClient();
    client.setQueryData(["note", "note-1"], makeNote({ title: "Doomed" }));
    client.setQueryData(["notes", {}], { notes: [makeNote()], total: 1 });
    client.setQueryData(["notes", { trashed: true }], { notes: [makeNote({ id: "old" })], total: 1 });

    patchNoteInLists(client, "note-1", { deletedAt: "2026-09-24T10:00:00Z" });

    expect(client.getQueryData(["notes", {}]).notes).toHaveLength(0);
    expect(client.getQueryData(["notes", {}]).total).toBe(0);
    const trash = client.getQueryData(["notes", { trashed: true }]);
    expect(trash.notes).toHaveLength(2);
    expect(trash.notes[0].id).toBe("note-1");
    expect(trash.total).toBe(2);
  });

  it("restores a note out of the trash list into all-notes", () => {
    const client = newClient();
    client.setQueryData(["note", "note-1"], { ...makeNote(), deletedAt: "2026-09-24T10:00:00Z" });
    client.setQueryData(["notes", {}], { notes: [], total: 0 });
    const trashed = { id: "note-1", deletedAt: "2026-09-24T10:00:00Z", isPinned: false };
    client.setQueryData(["notes", { trashed: true }], { notes: [trashed], total: 1 });

    patchNoteInLists(client, "note-1", { deletedAt: null });

    expect(client.getQueryData(["notes", { trashed: true }]).notes).toHaveLength(0);
    expect(client.getQueryData(["notes", { trashed: true }]).total).toBe(0);
    const all = client.getQueryData(["notes", {}]);
    expect(all.notes).toHaveLength(1);
    expect(all.notes[0].id).toBe("note-1");
    expect(all.total).toBe(1);
  });
});

describe("insertNoteIntoLists", () => {
  it("prepends a matching note to non-infinite lists and bumps total", () => {
    const client = newClient();
    client.setQueryData(["notes", {}], { notes: [makeNote({ id: "a" })], total: 1 });
    client.setQueryData(["notes", { isFavorite: true }], { notes: [makeNote({ id: "b", isFavorite: true })], total: 1 });

    insertNoteIntoLists(client, makeNote({ id: "new", isFavorite: true }));

    expect(client.getQueryData(["notes", {}]).notes[0].id).toBe("new");
    expect(client.getQueryData(["notes", {}]).total).toBe(2);
    expect(client.getQueryData(["notes", { isFavorite: true }]).notes[0].id).toBe("new");
    expect(client.getQueryData(["notes", { isFavorite: true }]).total).toBe(2);
  });

  it("does not insert into lists whose filters the note does not match", () => {
    const client = newClient();
    client.setQueryData(["notes", { isPinned: true }], { notes: [], total: 0 });
    client.setQueryData(["notes", { search: "foo" }], { notes: [], total: 0 });

    insertNoteIntoLists(client, makeNote({ id: "new" }));

    expect(client.getQueryData(["notes", { isPinned: true }]).notes).toHaveLength(0);
    expect(client.getQueryData(["notes", { isPinned: true }]).total).toBe(0);
    expect(client.getQueryData(["notes", { search: "foo" }]).notes).toHaveLength(0);
  });

  it("prepends a matching note to the first infinite page and bumps totals", () => {
    const client = newClient();
    client.setQueryData(["notes", "infinite", {}], {
      pages: [
        { notes: [makeNote({ id: "a" })], total: 2, page: 1, hasMore: false },
        { notes: [makeNote({ id: "b" })], total: 2, page: 2, hasMore: false },
      ],
      pageParams: [1, 2],
    });

    insertNoteIntoLists(client, makeNote({ id: "new" }));

    const data = client.getQueryData(["notes", "infinite", {}]);
    expect(data.pages[0].notes[0].id).toBe("new");
    expect(data.pages[0].total).toBe(3);
    expect(data.pages[1].total).toBe(3);
  });
});

describe("removeNoteFromAllLists", () => {
  it("removes a note from every cached list and decrements totals", () => {
    const client = newClient();
    client.setQueryData(["notes", {}], { notes: [makeNote(), makeNote({ id: "keep" })], total: 2 });
    client.setQueryData(["notes", "infinite", {}], {
      pages: [{ notes: [makeNote()], total: 1, page: 1 }],
      pageParams: [1],
    });

    removeNoteFromAllLists(client, "note-1");

    expect(client.getQueryData(["notes", {}]).notes.map((n) => n.id)).toEqual(["keep"]);
    expect(client.getQueryData(["notes", {}]).total).toBe(1);
    expect(client.getQueryData(["notes", "infinite", {}]).pages[0].notes).toHaveLength(0);
    expect(client.getQueryData(["notes", "infinite", {}]).pages[0].total).toBe(0);
  });
});