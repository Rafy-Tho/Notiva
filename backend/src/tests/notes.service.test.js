import { beforeEach, describe, expect, it, vi } from "vitest";

const noteRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}));

vi.mock("../modules/notes/note.repository.js", () => ({
  ...noteRepository,
}));

const { updateNote } = await import("../modules/notes/note.service.js");

describe("updateNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates explicit empty, false, null, and metadata values atomically", async () => {
    const updatedNote = { id: "note-1", updatedAt: "2026-09-04T00:00:01.000Z" };
    noteRepository.findByIdAndUpdate.mockResolvedValue(updatedNote);

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
      ),
    ).resolves.toBe(updatedNote);

    expect(noteRepository.findByIdAndUpdate).toHaveBeenCalledWith(
      "note-1",
      {
        content: "",
        cover: { color: null, emoji: null },
        isFavorite: false,
        notebookId: null,
        tagIds: [],
        title: "",
        wordCount: 0,
      },
    );
  });

  it("returns a conflict when the expected version is stale", async () => {
    noteRepository.findByIdAndUpdate.mockResolvedValue(null);
    noteRepository.findById.mockResolvedValue({ _id: "note-1" });

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
    noteRepository.findByIdAndUpdate.mockResolvedValue(null);
    noteRepository.findById.mockResolvedValue(null);

    await expect(
      updateNote("user-1", "missing", { content: "<p>new</p>" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
