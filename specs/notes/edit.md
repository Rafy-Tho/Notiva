# Note Editing

## Status

IMPLEMENTED

## Purpose

Update existing note title and content.

## Actor

Authenticated users

## Entry Points

- NoteDetailPage (auto-save on edit)
- NoteEditor component (TipTap editor)
- Note actions menu (edit option)

## Preconditions

- User is authenticated
- Note exists and belongs to user
- Note is not permanently deleted

## Input

- title: string (optional)
- content: string (optional, HTML/Tiptap content)
- markdown: string (optional)
- isPinned, isFavorite, isArchived: boolean (optional)

## Validation

- Content length limits
- HTML sanitization

## Behavior

1. Validate input
2. Find note by id
3. Verify ownership (userId matches)
4. Update note fields
5. Update timestamp
6. Return updated note

## Frontend

- NoteDetailPage component
- NoteEditor component (TipTap)
- EditorToolbar component (toolbar with link + image Popovers, block-type dropdown, text-alignment dropdown, and table "options" DropdownMenu)
- NoteStatusBar component (word/char count, reading time, save state, focus-mode toggle)
- useAutosave hook
- useNotes.update mutation

#### Editor screen UX

- **Metadata line** below the title: "Edited Xm ago · Created date · X min read" (client-side, from the note's `updatedAt`/`createdAt`).
- **Status bar** pinned to the bottom of the editor column: live word & character counts, reading time, compact save state ("Saving… / Saved / Unsaved / Conflict"), and a Focus-mode toggle.
- **Focus mode** (`⌘/` or the status-bar toggle, `Esc` to exit): hides the global header, note list column, meta/actions row, and editor toolbar for a distraction-free full-height writing surface. Session-only (not persisted).
- **Immediate action feedback**: the notebook selector, tag popover/chips, and pin/star buttons render directly from the cached note (`["note", id]`), so clicking any of them updates the editor UI instantly via optimistic cache writes (no reload required). Metadata actions also patch every cached note list in place (`frontend/src/features/notes/lib/noteListCache.js`) — notes move into/out of filtered lists (favorites/pinned/notebook/tag/archive/trash) immediately, and pinned notes hoist to the top of default-ordered lists, **without refetching the `/notes` list**. Title/content autosaves also patch the list cache: each list card's `title`, `contentPreview` (derived from content with `htmlToText(...).slice(0, 50)`, mirroring `listNotes`), `wordCount` (in `onMutate`, derived from the draft; authoritative on `onSuccess`) and `updatedAt` update instantly, and the edited note hoists to the top of default-ordered lists (not title-sorted/search/date-filtered lists). Full `content` is never stored in list entries. Sidebar count rows (`All / Favorites / Archive / Trash` and notebook/tag counts in `useNoteCountsStore`) update from pure deltas (`frontend/src/lib/noteCounts.js`) applied only in `onMutate` (never double-applied in `onSuccess`), and are snapshot/restored on error. Pin toggling intentionally changes no count. On failure the note, list, and count caches are rolled back and a toast shows the error.

#### Rich text capabilities

- Paragraphs, H1/H2/H3 headings (via a block-type dropdown + toolbar buttons), bold, italic, underline, strikethrough, inline code, code blocks, blockquote, task lists, ordered/unordered lists, tables, horizontal rules, images (paste/URL), text alignment
- **Links**: TipTap `Link` extension with `autolink`, `linkOnPaste`, `openOnClick: false`; rendered as `text-primary underline` + `cursor-pointer`, opening in a new tab (`target="_blank"`, `rel="noopener noreferrer nofollow"`); toolbar Link Popover with auto-`https://` prefix.
- **Images**: TipTap `Image` extension with `allowBase64: true` (paste image files inline as data URLs); toolbar Image Popover inserts a remote image by URL.
- **Text alignment**: `@tiptap/extension-text-align` (heading + paragraph); toolbar alignment dropdown (left/center/right/justify + unset).
- **Block type**: toolbar dropdown to switch the current block to Paragraph / H1 / H2 / H3 / Blockquote / Code block.
- **Table manipulation**: inserting a table adds a table toolbar button; while the cursor is inside a table, a "Table options" dropdown offers insert row above/below, insert column left/right, merge/split cells, toggle header row/column, delete row/column, and delete table. Text alignment works inside table cells (paragraph nodes). Selected cells are highlighted while multi-selecting for merge.

## API

`PATCH /api/v1/notes/:id`

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

Updates Note document fields

## Authorization

Authenticated users only; note must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized (note not owned)
- 404: Note not found

## Side Effects

- Note document updated
- Frontend cache invalidated/updated

## Edge Cases

- Concurrent edits (last-write-wins)
- Empty field preservation

## Tests

- frontend/src/hooks/useAutosave.test.js

## Source Evidence

Frontend:
- frontend/src/features/notes/pages/NoteDetailPage.jsx
- frontend/src/features/notes/components/NoteEditor.jsx
- frontend/src/features/notes/components/EditorToolbar.jsx
- frontend/src/features/notes/components/NoteStatusBar.jsx
- frontend/src/hooks/useAutosave.js
- frontend/src/store/useUIStore.js (focusMode)

Backend:
- backend/src/modules/notes/note.routes.js
- backend/src/modules/notes/note.controller.js
- backend/src/modules/notes/note.service.js

## Unknowns

- Auto-save debounce timing
