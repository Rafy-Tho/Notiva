# Note Trash System

## Status

IMPLEMENTED

## Purpose

Recover or permanently delete soft-deleted notes.

## Actor

Authenticated users

## Entry Points

- Sidebar → Trash link
- Trash page in frontend

## Preconditions

- User is authenticated
- User has trashed notes (for viewing)

## Input

- offset: number (optional pagination)
- limit: number (optional pagination)

## Validation

- None (optional pagination params)

## Behavior

**View Trashed Notes:**
1. Validate input
2. Find notes where isTrashed=true AND userId=user
3. Apply pagination
4. Return trashed notes

**Restore Note:**
1. Find note by id
2. Verify ownership
3. Clear isTrashed and deletedAt

**Purge Note:**
1. Find note by id
2. Verify ownership
3. Delete note permanently

## Frontend

- NotesPage component (with isTrashed filter)
- Sidebar trash link

## API

- GET /api/v1/notes/trash
- POST /api/v1/notes/:id/restore

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

- Filter by isTrashed and deletedAt fields

## Authorization

Authenticated users only; returns only user's trashed notes

## Errors

- 400: Validation errors
- 401: Not authenticated

## Side Effects

- Note restoration updates fields
- Note purging deletes document
- Frontend (no refetch): restore/delete toggle the `deletedAt` transition in every cached list (`patchNoteInLists`); purge removes the note everywhere (`removeNoteFromAllLists`); `Trash` count updates via `noteCountsDelta` / `notePurgeDelta`

## Edge Cases

- Permanently deleted notes cannot be restored
- Trashed notes are hidden from main notes list

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/NotesPage.jsx
- frontend/src/store/notesStore.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js
- backend/src/models/Note.js

## Unknowns

- None significant
