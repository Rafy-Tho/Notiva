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
- Account exists and is not locked

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
4. Generate JWT token
5. Set httpOnly cookie with token
6. Redirect to notes page

## Frontend

- LoginPage component
- authStore.auth mutation

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
- 401: Invalid credentials
- 404: User not found

## Side Effects

- JWT token generated
- httpOnly cookie set

## Edge Cases

- Email comparison is case-insensitive
- Login attempts may be rate limited

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/auth/LoginPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/routes/auth.routes.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/models/User.js

## Unknowns

- Rate limiting details
