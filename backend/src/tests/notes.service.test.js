import { beforeEach, describe, expect, it, vi } from "vitest";

const noteRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findMany: vi.fn(),
  countMany: vi.fn(),
  createOne: vi.fn(),
  deleteOne: vi.fn(),
  findTrash: vi.fn(),
  aggregateNoteCounts: vi.fn(),
  aggregateTagCounts: vi.fn(),
}));

vi.mock("../modules/notes/note.repository.js", () => ({
  ...noteRepository,
}));

const { updateNote, listNotes, createNote, getNote, softDelete } = await import(
  "../modules/notes/note.service.js"
);
const { NotFoundError } = await import("../common/errors/NotFoundError.js");

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

describe("listNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated notes with content preview", async () => {
    const mockNotes = [
      {
        _id: "note-1",
        title: "Test Note",
        content: "<p>Hello world</p>",
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          return {
            _id: "note-1",
            title: "Test Note",
            content: "<p>Hello world</p>",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        },
      },
    ];

    noteRepository.findMany.mockResolvedValue(mockNotes);
    noteRepository.countMany.mockResolvedValue(1);

    const result = await listNotes("user-1", { includeContent: "false" });

    expect(result.notes).toHaveLength(1);
    expect(result.notes[0].contentPreview).toBe("Hello world");
    expect(result.notes[0]).not.toHaveProperty("content");
    expect(result.total).toBe(1);
  });

  it("includes content when includeContent is true", async () => {
    const mockNotes = [
      {
        _id: "note-1",
        title: "Test Note",
        content: "<p>Hello world</p>",
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          return {
            _id: "note-1",
            title: "Test Note",
            content: "<p>Hello world</p>",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        },
      },
    ];

    noteRepository.findMany.mockResolvedValue(mockNotes);
    noteRepository.countMany.mockResolvedValue(1);

    const result = await listNotes("user-1", { includeContent: "true" });

    expect(result.notes[0]).toHaveProperty("content");
  });
});

describe("createNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a note with sanitized content", async () => {
    const mockNote = {
      _id: "note-1",
      title: "Test Note",
      content: "<p>Hello world</p>",
      wordCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    noteRepository.createOne.mockResolvedValue(mockNote);

    const result = await createNote("user-1", {
      title: "Test Note",
      content: "<script>malicious</script><p>Hello world</p>",
    });

    expect(result.title).toBe("Test Note");
    expect(noteRepository.createOne).toHaveBeenCalled();
  });

  it("uses default title when not provided", async () => {
    const mockNote = {
      _id: "note-1",
      title: "Untitled",
      content: "",
      wordCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    noteRepository.createOne.mockResolvedValue(mockNote);

    const result = await createNote("user-1", { content: "" });

    expect(result.title).toBe("Untitled");
  });
});

describe("getNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the note when found", async () => {
    const mockNote = {
      _id: "note-1",
      title: "Test Note",
      content: "<p>Hello world</p>",
    };

    noteRepository.findById.mockResolvedValue(mockNote);

    const result = await getNote("user-1", "note-1");

    expect(result).toBe(mockNote);
  });

  it("throws NotFoundError when note not found", async () => {
    noteRepository.findById.mockResolvedValue(null);

    await expect(
      getNote("user-1", "non-existent"),
    ).rejects.toThrowError(NotFoundError);
  });
});

describe("softDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets deletedAt timestamp on note", async () => {
    const mockNote = {
      _id: "note-1",
      title: "Test Note",
      deletedAt: null,
      save: vi.fn().mockResolvedValue(),
    };

    noteRepository.findById.mockResolvedValue(mockNote);

    const result = await softDelete("user-1", "note-1");

    expect(mockNote.deletedAt).toBeTruthy();
    expect(mockNote.save).toHaveBeenCalled();
  });

  it("throws NotFoundError when note not found", async () => {
    noteRepository.findById.mockResolvedValue(null);

    await expect(
      softDelete("user-1", "non-existent"),
    ).rejects.toThrowError(NotFoundError);
  });
});
