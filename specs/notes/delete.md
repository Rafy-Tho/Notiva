# Note Deletion

## Status

IMPLEMENTED

## Purpose

Remove notes from user's account (soft delete with permanent purge option).

## Actor

Authenticated users

## Entry Points

- Note actions menu (Delete)
- NoteDetailPage delete button
- Trash page delete options

## Preconditions

- User is authenticated
- Note exists and belongs to user

## Input

Note id

## Validation

- Note id validation

## Behavior

**Soft Delete (default):**
1. Validate input
2. Find note by id
3. Verify ownership
4. Set deletedAt timestamp
5. Mark isTrashed true

**Permanent Delete (Purge):**
1. Find note by id
2. Verify ownership
3. Delete note document permanently

## Frontend

- Note actions menu component
- NoteDetailPage
- useNotes.delete mutation

## API

- DELETE /api/v1/notes/:id (soft delete)
- POST /api/v1/notes/:id/purge (permanent)

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

- Soft: Updates deletedAt and isTrashed fields
- Permanent: Deletes Note document

## Authorization

Authenticated users only; note must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized
- 404: Note not found

## Side Effects

- Note document updated or deleted
- Note count updated in frontend

## Edge Cases

- Already trashed notes cannot be soft-deleted again
- Permanently deleted notes cannot be recovered

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/components/note/NoteActions.jsx
- frontend/src/store/notesStore.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js
- backend/src/models/Note.js

## Unknowns

- None significant
