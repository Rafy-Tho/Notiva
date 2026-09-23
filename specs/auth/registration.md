# User Registration

## Status

IMPLEMENTED

## Purpose

Create new unverified user accounts with email and password credentials and send an email verification code.

## Actor

Public (unauthenticated users)

## Entry Points

- `/register` route in frontend router
- "Register" link in AppHeader

## Preconditions

- User is not already authenticated
- Email is not already registered as a verified account

## Input

- email: string
- password: string (min 8 characters)
- name: string

## Validation

- Email format validation
- Password minimum length (8 characters)
- Name max length (50 characters)

## Behavior

1. Validate input fields
2. Check if email already exists
3. If exists and unverified: reuse the existing account (password unchanged) and send a new verification code
4. If exists and verified: return 409 conflict
5. Otherwise hash password with bcrypt (cost 12) and create the user as unverified (`emailVerifiedAt = null`)
6. Generate a 6-digit verification code, hash with SHA-256, store with 15-minute expiry (single-use, per-user)
7. Send the code to the user's email
8. Redirect to the email verification page (`/verify-email`). **No session/cookie is created.**

## Frontend

- RegisterPage component
- authStore.register mutation (does not persist an authenticated user)
- RegistrationVerificationPage component

## API

`POST /api/v1/auth/register`

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- email.service.js
- email_verification.repository.js
- User / EmailVerificationToken models

## Database

Creates User with fields: email, password (hashed), name, emailVerifiedAt (null), avatar, createdAt, updatedAt. Creates an EmailVerificationToken row.

## Authorization

Public endpoint (no authentication required)

## Errors

- 400: Validation errors
- 409: Email already exists and is verified

## Side Effects

- User document created (unverified)
- Verification email sent
- EmailVerificationToken row created

## Edge Cases

- Email comparison is case-insensitive
- Registering an email that exists but is unverified reuses the account and resends the code
- Duplicate registration attempts on a verified account return 409
- Verification codes are SHA-256 hashed, expire after 15 minutes, and are single-use

## Tests

Not found in test suite (new verification flow validated via integration script)

## Source Evidence

Frontend:
- frontend/src/features/auth/pages/RegisterPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/modules/auth/auth.routes.js
- backend/src/modules/auth/auth.controller.js
- backend/src/modules/auth/auth.service.js
- backend/prisma/schema.prisma (User / EmailVerificationToken)

## Unknowns

- None
