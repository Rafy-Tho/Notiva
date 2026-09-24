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
- EditorToolbar component (toolbar with link Popover + table "options" DropdownMenu)
- useAutosave hook
- useNotes.update mutation

#### Rich text capabilities

- Paragraphs, H1/H2/H3 headings, bold, italic, underline, strikethrough, code, code blocks, blockquote, task lists, ordered/unordered lists, tables, horizontal rules, images (paste/URL), alignment
- **Links**: TipTap `Link` extension with `autolink`, `linkOnPaste`, `openOnClick: false`; rendered as `text-primary underline` + `cursor-pointer`, opening in a new tab (`target="_blank"`, `rel="noopener noreferrer nofollow"`)
- **Table manipulation**: inserting a table adds a table toolbar button; while the cursor is inside a table, a "Table options" dropdown offers add/delete row/column operations and delete table

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
- frontend/src/hooks/useAutosave.js

Backend:
- backend/src/modules/notes/note.routes.js
- backend/src/modules/notes/note.controller.js
- backend/src/modules/notes/note.service.js

## Unknowns

- Auto-save debounce timing
