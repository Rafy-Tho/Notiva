# Email Verification

## Status

IMPLEMENTED

## Purpose

Verify a user's email address with a 6-digit code, then log the user in automatically.

## Actor

Public (unauthenticated users)

## Entry Points

- `/verify-email` route in frontend router (reached from registration or unverified login)
- `/auth/verify-email` API
- `/auth/resend-verification` API

## Preconditions

- User account exists and is unverified (`emailVerifiedAt = null`)
- A verification token exists (created at registration or by resend)

## Input

**Verify:**
- email: string
- code: string (6 digits)

**Resend:**
- email: string

## Validation

- Email format validation
- Code must be exactly 6 digits

## Behavior

**Verify Flow:**
1. Validate email and code
2. Find the user by email; reject if already verified
3. Look up the un-used, unexpired token by `(userId, hashed code)`
4. Mark the user's email verified and the token used (single-use)
5. Create a normal server session and set the `noteflow_session` cookie
6. Return the user — no password re-entry required

**Resend Flow:**
1. Validate email
2. Reject unknown users (401) and already-verified users (400)
3. Rate limit per email (5/hour)
4. Delete prior verification tokens for the user
5. Generate a new 6-digit code, hash with SHA-256, store with 15-minute expiry
6. Send the code via email

## Frontend

- RegistrationVerificationPage component (code entry + resend)
- authStore.verifyEmailCode / authStore.resendVerificationCode
- LoginPage redirects unverified logins to `/verify-email`

## API

- POST /api/v1/auth/verify-email
- POST /api/v1/auth/resend-verification

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- email.service.js
- email_verification.repository.js
- EmailVerificationToken model

## Database

Creates/consumes EmailVerificationToken rows (tokenHash, expiresAt, usedAt). Sets `User.emailVerifiedAt` on success.

## Authorization

Public endpoints

## Errors

- 400: Validation errors / already verified
- 401: Unknown user / invalid or expired code
- 429: Rate limited (resend)

## Side Effects

- Email sent with 6-digit code
- EmailVerificationToken row created or marked used
- User marked verified
- Session created and cookie set (verify-email)

## Edge Cases

- Codes are SHA-256 hashed, expire after 15 minutes, single-use (`usedAt`)
- Resending invalidates the previous code (prior token deleted)
- Tokens are scoped per user (`@@index([userId, tokenHash])`), so equal 6-digit codes across users cannot collide

## Tests

Not found in test suite (validated via integration script)

## Source Evidence

Frontend:
- frontend/src/features/auth/pages/RegistrationVerificationPage.jsx
- frontend/src/store/authStore.js

Backend:
- backend/src/modules/auth/auth.routes.js
- backend/src/modules/auth/auth.controller.js
- backend/src/modules/auth/auth.service.js
- backend/src/modules/auth/email_verification.repository.js
- backend/prisma/schema.prisma (EmailVerificationToken model)

## Unknowns

- Email template details