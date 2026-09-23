# Google Login (OAuth 2.0 / OpenID Connect)

## Status

IMPLEMENTED

## Purpose

Let users sign in (or sign up) with their Google account using the existing server-side session system.

## Actor

Public (unauthenticated users)

## Entry Points

- "Sign in with Google" button on `/login`
- Backend routes `GET /api/v1/auth/google` and `GET /api/v1/auth/google/callback`

## Preconditions

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are configured
- `GOOGLE_CALLBACK_URL` is whitelisted in the Google Cloud console
- User is not already authenticated

## Input

- OAuth `state` (server-generated, httpOnly cookie, 10-min expiry)
- OAuth `code` from Google's callback (exchanged server-side)

## Validation

- `state` must match the server-set `oauth_state` cookie (cleared after use)
- Google `error` query param (e.g. `access_denied`) is treated as a cancelled login
- ID token verified server-side: RS256 signature against Google JWKS, `iss` in `https://accounts.google.com`/`accounts.google.com`, `aud === GOOGLE_CLIENT_ID`, `exp` in future, `email_verified === true`
- Google `sub` is the identity — the email is never used as `provider_user_id`

## Behavior

1. `GET /auth/google` sets an `oauth_state` cookie with a random value and redirects to Google's consent screen (scope `openid email profile`)
2. Google redirects to `GET /auth/google/callback`
3. Backend validates state, handles cancellation, exchanges the code, and verifies the ID token
4. User resolution:
   - AuthAccount found by `(provider='google', provider_user_id=sub)` → log in that user
   - Existing user found by the verified Google email → link the account; set `emailVerifiedAt` if null; never change the password
   - No user → create a new verified user (name/avatar from Google, random unusable bcrypt password) and link the account
5. Reject soft-deleted accounts
6. Create a normal server session, set the `noteflow_session` httpOnly cookie
7. Redirect to the frontend root (SPA `restoreSession()` persists the login)

## Frontend

- `LoginPage` component (Google button navigates to `getApiUrl('/auth/google')`)
- `?oauth_error` query parameter on `/login` shows a toast (`cancelled`, `invalid_state`, `invalid_callback`, `google_failed`, `google_not_configured`)

## API

- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`

## Backend

- `auth.routes.js` (route registration)
- `oauth.controller.js` (state cookie, redirects)
- `oauth.service.js` (auth URL, token exchange, JWKS ID-token verification, user resolution, race recovery)
- `oauth.repository.js` (AuthAccount data access)

## Database

- `auth_accounts` table (`provider`, `provider_user_id`, unique together, FK `user_id` → User cascade delete)

## Authorization

Public endpoints (no session required); the resulting session is a standard `UserSession`.

## Errors

- Failure redirects to `FRONTEND_ORIGIN/login` with `oauth_error` set (`cancelled`, `invalid_state`, `invalid_callback`, `google_failed`, `google_not_configured`) — never a JSON envelope in the browser
- Soft-deleted accounts are rejected server-side (`401 ACCOUNT_DELETED`)

## Side Effects

- Server session created (`UserSession` row + `noteflow_session` cookie)
- `auth_accounts` row created or reused
- `emailVerifiedAt` ensured on the linked/created user
- `oauth_state` cookie set on start, cleared on completion/failure

## Edge Cases

- One Google account cannot be linked to multiple users: `UNIQUE(provider, provider_user_id)` + `P2002` recovery (re-read the winning account)
- Concurrent callbacks: race recovery re-fetches the account and logs in its user
- Duplicate user email: `User.email` unique constraint handles concurrent sign-ups; the loser links to the existing user
- Cancelled login at Google → redirect with `?oauth_error=cancelled`
- Missing Google config → `?oauth_error=google_not_configured`

## Tests

- `backend/src/tests/oauth.service.test.js` (8 vitest cases: new user creation, email linking, existing account login, deleted user rejection, race recovery, invalid signature, expired token, unverified Google email)

## Source Evidence

Frontend:
- frontend/src/features/auth/pages/LoginPage.jsx

Backend:
- backend/src/modules/auth/oauth.controller.js
- backend/src/modules/auth/oauth.service.js
- backend/src/modules/auth/oauth.repository.js
- backend/src/modules/auth/auth.routes.js
- backend/prisma/schema.prisma (AuthAccount)

## Unknowns

- None