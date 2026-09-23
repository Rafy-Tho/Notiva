# Password Reset

## Status

IMPLEMENTED

## Purpose

Recover account access when user forgets password.

## Actor

Public (unauthenticated users)

## Entry Points

- `/update-password` route (frontend)
- `/auth/reset-password-code` API
- `/auth/confirm-password-reset` API

## Preconditions

- User account exists (for reset-password-code)
- Valid 6-digit code (for confirm-password-reset)

## Input

**Request Reset Code:**
- email: string

**Confirm Reset:**
- email: string
- code: string (6 digits)
- password: string (min 8 characters)

## Validation

- Email format validation
- Code validity and expiration check
- Password minimum length

## Behavior

**Request Reset Code Flow:**
1. Validate email
2. Find user by email
3. Reject silently (generic response) for unknown or unverified emails — no token, no email (prevents enumeration)
4. Check rate limit (5 per hour)
5. Generate 6-digit code
6. Create PasswordResetToken row (SHA-256 hashed, 15-minute expiry, per-user)
7. Send code via email

**Confirm Reset Flow:**
1. Validate code and check expiration
2. Find un-used, unexpired PasswordResetToken by (userId, hashed code)
3. Hash new password with bcrypt (cost 12)
4. Update user password
5. Mark token as used
6. Revoke all of the user's existing sessions

## Frontend

- UpdatePasswordPage component (3-step form: email → code → new password)

## API

- POST /api/v1/auth/reset-password-code
- POST /api/v1/auth/confirm-password-reset

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- email.service.js
- password_reset.repository.js
- PasswordResetToken model

## Database

Creates a PasswordResetToken row (tokenHash, expiresAt, usedAt). Reset tokens are not stored on the User document.

## Authorization

Public endpoint

## Errors

- 400: Validation errors
- 401: Invalid/expired reset code
- 429: Rate limited

## Side Effects

- Email sent with reset code (existing, verified accounts only)
- PasswordResetToken row created / marked used
- All sessions revoked on successful reset

## Edge Cases

- Code expiration (15 minutes)
- Multiple reset requests invalidate previous tokens (deleteByUserId)
- Codes are single-use (usedAt flag)
- Unknown or unverified emails receive the same generic response (no email)

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/features/auth/pages/UpdatePasswordPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/modules/auth/auth.routes.js
- backend/src/modules/auth/auth.controller.js
- backend/src/modules/auth/auth.service.js
- backend/src/modules/auth/password_reset.repository.js
- backend/src/modules/email/email.service.js
- backend/prisma/schema.prisma (PasswordResetToken model)

## Unknowns

- Email template details