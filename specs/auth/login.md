# User Login

## Status

IMPLEMENTED

## Purpose

Authenticate existing users and establish session.

## Actor

Public (unauthenticated users)

## Entry Points

- `/login` route in frontend router
- "Login" link in AppHeader

## Preconditions

- User is not already authenticated
- Account exists, is verified, and is not locked

## Input

- email: string
- password: string

## Validation

- Email format validation
- Required fields check
- Password match check

## Behavior

1. Validate input fields
2. Find user by email
3. Verify password with bcrypt
4. Reject unverified users (401 "Email not verified")
5. Reset the failed-attempt counter on success
6. Create a server session and set the `noteflow_session` httpOnly cookie
7. Redirect to the notes page

## Frontend

- LoginPage component
- authStore.login mutation

## API

`POST /api/v1/auth/login`

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- User model

## Database

Reads User document by email

## Authorization

Public endpoint (no authentication required)

## Errors

- 400: Validation errors
- 401: Invalid credentials / deleted account
- 401: Email not verified (unverified accounts cannot log in)
- 429: Account temporarily locked (5 failed attempts/hour)

## Side Effects

- Server session created
- `noteflow_session` httpOnly cookie set

## Edge Cases

- Email comparison is case-insensitive
- Unverified users are blocked and routed to email verification
- Failed attempts reset after a successful login

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/features/auth/pages/LoginPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/modules/auth/auth.routes.js
- backend/src/modules/auth/auth.controller.js
- backend/src/modules/auth/auth.service.js
- backend/prisma/schema.prisma (User / UserSession)

## Unknowns

- None
