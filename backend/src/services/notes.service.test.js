import { beforeEach, describe, expect, it, vi } from "vitest";

const noteModel = vi.hoisted(() => ({
  exists: vi.fn(),
  findOneAndUpdate: vi.fn(),
}));

vi.mock("../models/Note.js", () => ({ default: noteModel }));

const { updateNote } = await import("./notes.service.js");

describe("updateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates explicit empty, false, null, and metadata values atomically", async () => {
    const updatedNote = { id: "note-1", updatedAt: "2026-09-04T00:00:01.000Z" };
    noteModel.findOneAndUpdate.mockResolvedValue(updatedNote);

    await expect(
      updateNote(
        "user-1",
        "note-1",
        {
          title: "",
          content: "",
          notebookId: null,
          tagIds: [],
          cover: { color: null, emoji: null },
          isFavorite: false,
        },
        { expectedUpdatedAt: "2026-09-04T00:00:00.000Z" },
      ),
    ).resolves.toBe(updatedNote);

    expect(noteModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "note-1",
        userId: "user-1",
        updatedAt: new Date("2026-09-04T00:00:00.000Z"),
      },
      {
        $set: {
          title: "",
          content: "",
          wordCount: 0,
          notebookId: null,
          tagIds: [],
          cover: { color: null, emoji: null },
          isFavorite: false,
        },
      },
      { new: true, runValidators: true },
    );
  });

  it("returns a conflict when the expected version is stale", async () => {
    noteModel.findOneAndUpdate.mockResolvedValue(null);
    noteModel.exists.mockResolvedValue({ _id: "note-1" });

    await expect(
      updateNote(
        "user-1",
        "note-1",
        { content: "<p>new</p>" },
        { expectedUpdatedAt: "2026-09-04T00:00:00.000Z" },
      ),
    ).rejects.toMatchObject({ status: 409, code: "NOTE_CONFLICT" });
  });

  it("returns not found when the note does not exist", async () => {
    noteModel.findOneAndUpdate.mockResolvedValue(null);
    noteModel.exists.mockResolvedValue(null);

    await expect(
      updateNote("user-1", "missing", { content: "<p>new</p>" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
