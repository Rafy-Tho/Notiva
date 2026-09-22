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
2. Build Prisma `where` with case-insensitive partial match on title/content
3. Filter by userId (ownership)
4. Apply pagination
5. Return matching notes

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

PostgreSQL `Note` table; case-insensitive `contains` match on `title` and `content`

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
- backend/src/modules/notes/note.routes.js
- backend/src/modules/notes/note.controller.js
- backend/src/modules/notes/note.service.js
- backend/src/modules/notes/note.repository.js
- backend/prisma/schema.prisma

## Unknowns

- None
