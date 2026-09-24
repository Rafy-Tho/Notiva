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
- NoteDetailPage action buttons (pin/star, archive)
- useNotes.togglePin / toggleFavorite / toggleArchive mutations (optimistic, no refetch)
- frontend/src/features/notes/lib/noteListCache.js (list cache patching)
- frontend/src/lib/noteCounts.js (count deltas)
- frontend/src/store/useNoteCountsStore.js (sidebar count rows)

All three toggles are fully optimistic and require **no refetch** of `/notes` or `/notes/counts`:

- The single-note cache `["note", id]` and every cached list (`["notes", …]`, `["notes", "infinite", …]`) are patched in place; notes leave/enter filtered lists (favorites/pinned/archive) instantly.
- Pinning hoists the note to the top of default-ordered lists and intentionally changes **no** sidebar count.
- Favorite/archive adjust the `Favorites` / `Archive` count rows via `noteCountsDelta`, applied **only in `onMutate`** (`onSuccess` only writes the authoritative server note, so deltas are never double-counted).
- On error, the note, list snapshots, and the previous count state are all restored.

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

- frontend/src/features/notes/lib/noteListCache.test.js (list membership, pin reorder, trash transitions, insert/remove helpers)
- frontend/src/lib/noteCounts.test.js (favorite/archive deltas via noteCountsDelta)

## Source Evidence

Frontend:
- frontend/src/features/notes/hooks/useNotes.js
- frontend/src/features/notes/pages/NoteDetailPage.jsx
- frontend/src/store/useNoteCountsStore.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js

## Unknowns

- None significant
