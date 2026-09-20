# Note Creation

## Status

IMPLEMENTED

## Purpose

Create new notes with title and content.

## Actor

Authenticated users

## Entry Points

- "New Note" button in NotesPage
- ⌘K/Ctrl+K keyboard shortcut (via command palette)
- Sidebar "Add Note" action

## Preconditions

- User is authenticated
- User has not exceeded note quota (if applicable)

## Input

- title: string (optional)
- content: string (optional, HTML/Tiptap content)
- markdown: string (optional)

## Validation

- Content length limits (if any)
- HTML sanitization on save

## Behavior

1. Validate input
2. Create new Note document with:
   - title (or auto-generated like "Note #123")
   - content (HTML)
   - markdown version
   - userId
   - timestamp fields
3. Return created note

## Frontend

- NotesPage component
- useNotes.create mutation (Zustand hook)
- Command palette integration

## API

`POST /api/v1/notes`

## Backend

- notes.routes.js
- notes.controller.js
- notes.service.js

## Database

Creates Note document with fields: title, content, markdown, userId, isPinned, isFavorite, isArchived, isTrashed, deletedAt, createdAt, updatedAt

## Authorization

Authenticated users only; note must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated

## Side Effects

- Note document created
- Updated note count in frontend

## Edge Cases

- Empty title auto-generated
- Initial content set to empty or placeholder

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/NotesPage.jsx
- frontend/src/store/notesStore.js
- frontend/src/hooks/useNotes.js

Backend:
- backend/src/routes/notes.routes.js
- backend/src/controllers/notes.controller.js
- backend/src/services/notes.service.js
- backend/src/models/Note.js

## Unknowns

- Default content for new notes
