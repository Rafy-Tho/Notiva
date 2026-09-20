# Note Organization

## Status

IMPLEMENTED

## Purpose

Organize notes using pin, favorite, and archive flags.

## Actor

Authenticated users

## Entry Points

- Note actions menu (Pin, Favorite, Archive)
- NoteDetailPage action buttons

## Preconditions

- User is authenticated
- Note exists and belongs to user
- Note is not permanently deleted

## Input

- Note id
- Action: pin/favorite/archive/unpin/unfavorite/unarchive

## Validation

- Note id validation
- Action validation

## Behavior

**Toggle Pin:**
1. Find note by id
2. Verify ownership
3. Toggle isPinned flag

**Toggle Favorite:**
1. Find note by id
2. Verify ownership
3. Toggle isFavorite flag

**Toggle Archive:**
1. Find note by id
2. Verify ownership
3. Toggle isArchived flag

## Frontend

- NoteActions component
- useNotes.togglePin mutation
- useNotes.toggleFavorite mutation
- useNotes.toggleArchive mutation

## API

- POST /api/v1/notes/:id/pin
- POST /api/v1/notes/:id/unpin
- POST /api/v1/notes/:id/favorite
- POST /api/v1/notes/:id/unfavorite
- POST /api/v1/notes/:id/archive
- POST /api/v1/notes/:id/unarchive

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

Updates Note document flags (isPinned, isFavorite, isArchived)

## Authorization

Authenticated users only; note must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized
- 404: Note not found

## Side Effects

- Note document updated
- Frontend cache updated

## Edge Cases

- Multiple flags can be set simultaneously
- Pinning an archived note is allowed

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

## Unknowns

- None significant
