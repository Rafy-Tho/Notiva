# Profile Management

## Status

IMPLEMENTED

## Purpose

View and update user profile information.

## Actor

Authenticated users

## Entry Points

- Settings page

## Preconditions

- User is authenticated

## Input

**Get Profile:**
- None

**Update Profile:**
- name: string (optional)
- email: string (optional)

## Validation

- Email format validation
- Name required

## Behavior

**Get Profile:**
1. Find user by authenticated userId
2. Return user profile (without sensitive fields)

**Update Profile:**
1. Find user by authenticated userId
2. Update allowed fields (name, email)
3. Return updated user

## Frontend

- SettingsPage component

## API

- GET /api/v1/me
- PATCH /api/v1/me

## Backend

- me.routes.js
- me.controller.js
- me.service.js

## Database

Reads/Updates User document

## Authorization

Authenticated users only; must access own profile

## Errors

- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized

## Side Effects

- User document updated (on PATCH)

## Edge Cases

- Email uniqueness check on update

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/SettingsPage.jsx

Backend:
- backend/src/routes/me.routes.js
- backend/src/controllers/me.controller.js
- backend/src/services/me.service.js
- backend/src/models/User.js

## Unknowns

- Whether email change triggers re-verification
