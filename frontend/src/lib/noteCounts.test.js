import { describe, expect, it } from "vitest";
import {
  applyCountsToState,
  noteCountsDelta,
  notePurgeDelta,
} from "./noteCounts";

function note(overrides = {}) {
  return {
    id: "n1",
    title: "T",
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    notebookId: null,
    tagIds: [],
    ...overrides,
  };
}

function baseState(overrides = {}) {
  return {
    all: 10,
    favorites: 3,
    archive: 2,
    trash: 1,
    notebooks: [
      { id: "nb-1", count: 4 },
      { id: "nb-2", count: 1 },
    ],
    tags: [{ id: "t-1", count: 5 }],
    ...overrides,
  };
}

describe("noteCountsDelta", () => {
  it("is all zeros for a pin toggle", () => {
    const d = noteCountsDelta(note(), note({ isPinned: true }));
    expect(d.all).toBe(0);
    expect(d.favorites).toBe(0);
    expect(d.archive).toBe(0);
    expect(d.trash).toBe(0);
    expect(d.notebooks).toEqual({});
    expect(d.tags).toEqual({});
  });

  it("adjusts favorites on favorite toggle", () => {
    expect(noteCountsDelta(note(), note({ isFavorite: true })).favorites).toBe(1);
    expect(noteCountsDelta(note({ isFavorite: true }), note()).favorites).toBe(-1);
  });

  it("adjusts archive on archive toggle", () => {
    expect(noteCountsDelta(note(), note({ isArchived: true })).archive).toBe(1);
    expect(noteCountsDelta(note({ isArchived: true }), note()).archive).toBe(-1);
  });

  it("moves a note between notebook counts", () => {
    const d = noteCountsDelta(
      note({ notebookId: "nb-1" }),
      note({ notebookId: "nb-2" }),
    );
    expect(d.notebooks).toEqual({ "nb-1": -1, "nb-2": 1 });
  });

  it("handles moving to no notebook", () => {
    const d = noteCountsDelta(note({ notebookId: "nb-1" }), note());
    expect(d.notebooks).toEqual({ "nb-1": -1 });
  });

  it("adjusts tag counts on tag add and remove", () => {
    const added = noteCountsDelta(
      note({ tagIds: ["t-1"] }),
      note({ tagIds: ["t-1", "t-2"] }),
    );
    expect(added.tags).toEqual({ "t-2": 1 });

    const removed = noteCountsDelta(
      note({ tagIds: ["t-1", "t-2"] }),
      note({ tagIds: ["t-1"] }),
    );
    expect(removed.tags).toEqual({ "t-2": -1 });
  });

  it("applies create deltas from a non-existent previous note", () => {
    const d = noteCountsDelta(
      null,
      note({ isFavorite: true, notebookId: "nb-1", tagIds: ["t-1"] }),
    );
    expect(d.all).toBe(1);
    expect(d.favorites).toBe(1);
    expect(d.notebooks).toEqual({ "nb-1": 1 });
    expect(d.tags).toEqual({ "t-1": 1 });
  });

  it("applies delete deltas (out of counts, into trash)", () => {
    const prev = note({ isFavorite: true, notebookId: "nb-1", tagIds: ["t-1"] });
    const d = noteCountsDelta(prev, { ...prev, deletedAt: "2026-09-24T10:00:00Z" });
    expect(d.all).toBe(-1);
    expect(d.favorites).toBe(-1);
    expect(d.trash).toBe(1);
    expect(d.notebooks).toEqual({ "nb-1": -1 });
    expect(d.tags).toEqual({ "t-1": -1 });
  });

  it("applies restore deltas (reverse of delete)", () => {
    const trashed = note({
      isFavorite: true,
      notebookId: "nb-1",
      tagIds: ["t-1"],
      deletedAt: "x",
    });
    const d = noteCountsDelta(trashed, { ...trashed, deletedAt: null });
    expect(d.all).toBe(1);
    expect(d.favorites).toBe(1);
    expect(d.trash).toBe(-1);
    expect(d.notebooks).toEqual({ "nb-1": 1 });
    expect(d.tags).toEqual({ "t-1": 1 });
  });
});

describe("notePurgeDelta", () => {
  it("only decrements trash for a trashed note", () => {
    const d = notePurgeDelta(note({ deletedAt: "x" }));
    expect(d.all).toBe(0);
    expect(d.favorites).toBe(0);
    expect(d.archive).toBe(0);
    expect(d.trash).toBe(-1);
  });

  it("does nothing for a non-trashed note", () => {
    expect(notePurgeDelta(note()).trash).toBe(0);
  });
});

describe("applyCountsToState", () => {
  it("clamps at zero and adds missing rows", () => {
    const next = applyCountsToState(baseState(), {
      all: -20,
      notebooks: { "nb-2": -1, "nb-3": 1 },
      tags: { "t-1": -5, "t-2": 1 },
    });
    expect(next.all).toBe(0);
    expect(next.favorites).toBe(3);
    expect(next.trash).toBe(1);
    expect(next.notebooks).toEqual([
      { id: "nb-1", count: 4 },
      { id: "nb-3", count: 1 },
    ]);
    expect(next.tags).toEqual([{ id: "t-2", count: 1 }]);
  });

  it("applies positive and negative scalars", () => {
    const next = applyCountsToState(baseState(), {
      all: 1,
      favorites: -2,
      archive: 3,
      trash: -1,
    });
    expect(next.all).toBe(11);
    expect(next.favorites).toBe(1);
    expect(next.archive).toBe(5);
    expect(next.trash).toBe(0);
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    applyCountsToState(state, { favorites: 1, notebooks: { "nb-2": -1 } });
    expect(state.favorites).toBe(3);
    expect(state.notebooks).toEqual([
      { id: "nb-1", count: 4 },
      { id: "nb-2", count: 1 },
    ]);
  });
});