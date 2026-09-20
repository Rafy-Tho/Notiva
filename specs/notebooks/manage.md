# Notebook Management

## Status

IMPLEMENTED

## Purpose

Organize notes into folders using notebooks.

## Actor

Authenticated users

## Entry Points

- Sidebar → Notebooks section
- NotebookRow component actions

## Preconditions

- User is authenticated

## Input

**Create:**
- name: string

**Update:**
- notebook id
- name: string (optional)

**Delete:**
- notebook id

## Validation

- Notebook name required for create
- Name length limits

## Behavior

**Create:**
1. Validate input
2. Create Notebook document with userId

**Read:**
1. Find notebooks where userId=user

**Update:**
1. Find notebook by id
2. Verify ownership
3. Update fields

**Delete:**
1. Find notebook by id
2. Verify ownership
3. Delete notebook

## Frontend

- Sidebar NotebookRow component
- useNotebooks hook (Zustand)

## API

- GET /api/v1/notebooks
- POST /api/v1/notebooks
- PATCH /api/v1/notebooks/:id
- DELETE /api/v1/notebooks/:id

## Backend

- notebooks.routes.js
- notebooks.controller.js
- notebook.service.js

## Database

Creates/Updates/Deletes Notebook document with fields: name, userId, createdAt, updatedAt

## Authorization

Authenticated users only; notebooks must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized
- 404: Notebook not found

## Side Effects

- Notebook document created/updated/deleted

## Edge Cases

- Deleting notebook does not delete its notes

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/components/sidebar/NotebookRow.jsx
- frontend/src/store/notebooksStore.js

Backend:
- backend/src/routes/notebooks.routes.js
- backend/src/controllers/notebooks.controller.js
- backend/src/services/notebook.service.js
- backend/src/models/Notebook.js

## Unknowns

- Maximum notebooks per user (if any)
