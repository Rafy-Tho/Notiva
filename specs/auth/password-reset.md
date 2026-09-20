# Password Reset

## Status

IMPLEMENTED

## Purpose

Recover account access when user forgets password.

## Actor

Public (unauthenticated users)

## Entry Points

- `/forgot-password` route
- `/reset-password` route

## Preconditions

- User account exists (for forgot-password)
- Valid reset token (for reset-password)

## Input

**Forgot Password:**
- email: string

**Reset Password:**
- token: string
- password: string (min 6 characters)

## Validation

- Email format validation
- Token validity and expiration check
- Password minimum length

## Behavior

**Forgot Password Flow:**
1. Validate email
2. Find user by email
3. Generate reset token
4. Update user with resetToken and resetTokenExpires
5. Send email with reset link via Brevo

**Reset Password Flow:**
1. Validate token and check expiration
2. Find user with matching resetToken
3. Hash new password
4. Update user password and clear reset token
5. Sign user out of all devices

## Frontend

- ForgotPasswordPage component
- ResetPasswordPage component

## API

- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password

## Backend

- auth.routes.js
- auth.controller.js
- auth.service.js
- email.service.js
- User model

## Database

Updates User document with resetToken and resetTokenExpires

## Authorization

Public endpoint

## Errors

- 400: Validation errors
- 404: User not found (forgot-password)
- 400: Invalid/expired token (reset-password)

## Side Effects

- Email sent via Brevo
- User resetToken updated
- All user sessions invalidated on password reset

## Edge Cases

- Token expiration (1 hour)
- Multiple reset requests invalidate previous token

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/pages/auth/ForgotPasswordPage.jsx
- frontend/src/pages/auth/ResetPasswordPage.jsx

Backend:
- backend/src/routes/auth.routes.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/services/email.service.js
- backend/src/models/User.js

## Unknowns

- Brevo template IDs used
