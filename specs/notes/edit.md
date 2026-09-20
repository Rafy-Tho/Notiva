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
- useAutosave hook
- useNotes.update mutation

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
- frontend/src/pages/NoteDetailPage.jsx
- frontend/src/components/note/NoteEditor.jsx
- frontend/src/hooks/useAutosave.js
- frontend/src/store/notesStore.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js

## Unknowns

- Auto-save debounce timing
