# Note Search

## Status

IMPLEMENTED

## Purpose

Find notes by searching title, content, and markdown text.

## Actor

Authenticated users

## Entry Points

- SearchPage component
- Search icon in sidebar
- ⌘K/Ctrl+K keyboard shortcut

## Preconditions

- User is authenticated
- Search query is provided

## Input

- query: string (search text)
- limit: number (optional pagination)
- offset: number (optional pagination)

## Validation

- Query required
- Query length limits (optional)

## Behavior

1. Validate input
2. Build MongoDB query with text search
3. Filter by userId (ownership)
4. Apply pagination
5. Return matching notes sorted by relevance

## Frontend

- SearchPage component
- useNotes.search hook

## API

`GET /api/v1/notes` with search parameter

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

MongoDB text indexes on Note collection (title, content, markdown fields)

## Authorization

Authenticated users only; returns only user's notes

## Errors

- 400: Validation errors (missing query)
- 401: Not authenticated

## Side Effects

- None

## Edge Cases

- Empty results return empty array
- Search is case-insensitive
- Special characters handled

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/SearchPage.jsx
- frontend/src/store/notesStore.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js
- backend/src/models/Note.js

## Unknowns

- Exact text index configuration
