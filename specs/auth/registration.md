# User Registration

## Status

IMPLEMENTED

## Purpose

Create new user accounts with email and password credentials.

## Actor

Public (unauthenticated users)

## Entry Points

- `/register` route in frontend router
- "Register" link in AppHeader

## Preconditions

- User is not already authenticated
- Email is not already registered

## Input

- email: string
- password: string (min 6 characters)
- name: string

## Validation

- Email format validation
- Password minimum length (6 characters)
- Unique email check

## Behavior

1. Validate input fields
2. Check if email already exists
3. Hash password with bcrypt (cost 12)
4. Create User document
5. Generate JWT token
6. Set httpOnly cookie with token
7. Redirect to notes page

## Frontend

- RegisterPage component
- authStore.auth mutation

## API

`POST /api/v1/auth/register`

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- User model

## Database

Creates User document with fields: email, password (hashed), name, avatar, createdAt, updatedAt

## Authorization

Public endpoint (no authentication required)

## Errors

- 400: Validation errors
- 409: Email already exists

## Side Effects

- User document created
- JWT token generated
- httpOnly cookie set

## Edge Cases

- Email comparison is case-insensitive
- Duplicate registration attempts return 409

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/auth/RegisterPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/routes/auth.routes.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/models/User.js

## Unknowns

- Email confirmation requirement (if any)
