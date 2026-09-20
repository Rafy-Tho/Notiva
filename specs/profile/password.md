# Password Change

## Status

IMPLEMENTED

## Purpose

Change user password after authentication.

## Actor

Authenticated users

## Entry Points

- Settings page password change form

## Preconditions

- User is authenticated
- User knows current password

## Input

- currentPassword: string
- newPassword: string (min 6 characters)

## Validation

- Current password required
- New password minimum length

## Behavior

1. Validate input
2. Find user by authenticated userId
3. Verify currentPassword with bcrypt
4. Hash newPassword
5. Update user password
6. Sign user out of all devices

## Frontend

- SettingsPage component

## API

`POST /api/v1/me/password`

## Backend

- me.routes.js
- me.controller.js
- me.service.js

## Database

Updates User.password (hashed)

## Authorization

Authenticated users only

## Errors

- 400: Validation errors
- 401: Invalid current password
- 401: Not authenticated

## Side Effects

- Password updated
- All user sessions invalidated

## Edge Cases

- Password history not enforced (can reuse old passwords)

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

- Password complexity requirements beyond minimum length
