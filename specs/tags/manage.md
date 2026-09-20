# Tag Management

## Status

IMPLEMENTED

## Purpose

Organize notes using tags for cross-cutting categorization.

## Actor

Authenticated users

## Entry Points

- Sidebar → Tags section
- TagRow component actions

## Preconditions

- User is authenticated

## Input

**Create:**
- name: string

**Update:**
- tag id
- name: string (optional)

**Delete:**
- tag id

## Validation

- Tag name required for create
- Name length limits

## Behavior

**Create:**
1. Validate input
2. Create Tag document with userId

**Read:**
1. Find tags where userId=user

**Update:**
1. Find tag by id
2. Verify ownership
3. Update fields

**Delete:**
1. Find tag by id
2. Verify ownership
3. Delete tag

## Frontend

- Sidebar TagRow component
- useTags hook (Zustand)

## API

- GET /api/v1/tags
- POST /api/v1/tags
- PATCH /api/v1/tags/:id
- DELETE /api/v1/tags/:id

## Backend

- tags.routes.js
- tags.controller.js
- tags.service.js

## Database

Creates/Updates/Deletes Tag document with fields: name, userId, createdAt, updatedAt

## Authorization

Authenticated users only; tags must belong to user

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized
- 404: Tag not found

## Side Effects

- Tag document created/updated/deleted

## Edge Cases

- Deleting tag does not update notes that use it

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/components/sidebar/TagRow.jsx
- frontend/src/store/tagsStore.js

Backend:
- backend/src/routes/tags.routes.js
- backend/src/controllers/tags.controller.js
- backend/src/services/tags.service.js
- backend/src/models/Tag.js

## Unknowns

- Maximum tags per user (if any)
