# NoteFlow — Authentication

## Authentication Methods

NoteFlow uses **opaque server-session authentication** stored in PostgreSQL. A raw 32-byte random token is delivered via an httpOnly cookie named `noteflow_session`; only its SHA-256 hash is persisted in the `UserSession` table. No JWT is used.

---

## Registration (`POST /auth/register`)

**Flow:**
1. User provides `name`, `email`, `password` (password min 8 chars)
2. Backend validates input, hashes the password with bcrypt (cost 12)
3. Creates the user with `emailVerifiedAt = null` (unverified)
4. Generates a 6-digit verification code, hashes it (SHA-256), stores it with a 15-minute expiry (single-use)
5. Sends the code via email (Hostinger mail API)
6. Returns the unverified user — **no session is created and no cookie is set**

**Existing unverified email:** the account is reused as-is (password unchanged) and a fresh verification code is sent.

**Existing verified email:** `409 User already exists and is verified`.

---

## Email Verification (`POST /auth/verify-email`)

**Flow:**
1. User provides `email` and the 6-digit code
2. Backend finds the un-used, unexpired token by (userId, hashed code)
3. Marks the user's email verified (`emailVerifiedAt`) and the token used (`usedAt`)
4. Creates a **normal server session** and sets the `noteflow_session` cookie — the user is logged in automatically (no password re-entry)

## Resend Code (`POST /auth/resend-verification`)

- Reuses the verification flow; prior tokens for the user are deleted first
- Rate limited per email (5/hour)

---

## Login (`POST /auth/login`)

**Flow:**
1. User provides `email` and `password`
2. Backend finds the user by email and verifies the password with bcrypt compare
3. **Unverified users are rejected** with `401 Email not verified` (they must verify first)
4. Failed attempts are tracked per email; 5 failures within an hour lock the account for 15 minutes; the counter resets on a successful login
5. On success a server session is created and the `noteflow_session` cookie is set

**Session Expiration:** 7 days.

---

## Google Login (`GET /auth/google`, `GET /auth/google/callback`)

**Flow:**
1. The login page's "Sign in with Google" button navigates the browser to `GET /auth/google`
2. Backend generates a random `state`, stores it in an httpOnly `oauth_state` cookie (10-min expiry), and redirects to Google's consent screen
3. Google redirects back to `GET /auth/google/callback?code=...&state=...`; the callback validates `state` (clearing the cookie) and handles cancellations (`error=access_denied`)
4. Backend exchanges `code` for an ID token (client secret used server-side) and verifies the ID token signature against Google's JWKS, checking `iss`, `aud`, `exp`, and `email_verified` — Google identity is never trusted from the client
5. User resolution (Google `sub` is the identity, never the email):
   - **Account found** by `(provider='google', provider_user_id)` → log in that user
   - **Email found** (existing user) → link the Google account to that user; mark their email verified if it was unverified; their password is untouched
   - **No user** → create a new verified user (name/avatar from Google, random unusable bcrypt password) and link the Google account
6. The `UNIQUE(provider, provider_user_id)` constraint prevents one Google account from linking to multiple users; concurrent callbacks recover from `P2002` by re-reading the account
7. Soft-deleted users are rejected
8. Creates a **normal server session** and sets the `noteflow_session` cookie, then redirects to the frontend root (the SPA's `restoreSession()` picks up the session)

**Failure redirects** (to `FRONTEND_ORIGIN/login`): `?oauth_error=cancelled` (user cancelled), `invalid_state`, `invalid_callback`, `google_failed`, `google_not_configured`.

**Google-authenticated emails are treated as verified** (`emailVerifiedAt` set on create/link).

---

## Logout (`POST /auth/logout`)

**Flow:**
1. Clears the authentication cookie
2. Revokes the user's sessions server-side when a valid session is presented
3. Client clears state via `authStore.logout()`

---

## Session Restoration (`GET /auth/verify`)

**Flow:**
1. App mounts and calls `authStore.restoreSession()`
2. `GET /auth/verify` sends the httpOnly cookie
3. Server looks up the session by hashed token, checks expiry/revocation, and blocks unverified users
4. If valid: returns user data, client sets authenticated state
5. If invalid: returns 401, client clears user state

**Request-spam guards:**
- Concurrent boot calls (e.g. React StrictMode double-mount) are deduplicated — only one `/auth/verify` fires per page load.
- A 401 is treated as permanent and is **never retried** by `fetchWithAuth`.

---

## Password Reset Flow

### 1. Request Reset Code (`POST /auth/reset-password-code`)

**Flow:**
1. User provides `email`
2. Backend generates a 6-digit code, hashes it (SHA-256), stores it with a 15-minute expiry
3. Prior reset tokens for the user are deleted
4. Email sent via Hostinger mail API with the code
5. **Generic response** for unknown or unverified emails (no token created, no email sent) to prevent email enumeration

### 2. Complete Reset (`POST /auth/confirm-password-reset`)

**Flow:**
1. User provides `email`, `code`, and new `password`
2. Backend finds the un-used, unexpired reset token by (userId, hashed code)
3. Password is reset with bcrypt (cost 12)
4. Token marked as used (`usedAt`, single-use)
5. All of the user's existing sessions are revoked

---

## Token / Code Details

| Attribute | Server session | Verification / Reset codes |
|-----------|----------------|----------------------------|
| Raw value | 32-byte random hex | 6-digit numeric (`crypto.randomInt`) |
| Stored | SHA-256 hash only | SHA-256 hash only |
| Expiry | 7 days | 15 minutes |
| Single-use | N/A (revocable) | `usedAt` flag |
| Delivery | httpOnly cookie (`noteflow_session`) | email |

---

## Password Handling

| Aspect | Implementation |
|--------|----------------|
| **Hashing** | bcrypt with cost 12 |
| **Transmission** | HTTPS only (production) |
| **Storage** | Hash only (never plaintext) |
| **Reset** | 6-digit code, SHA-256 hashed, 15-minute expiry, single-use |

---

## Authentication Middleware

**File:** `backend/src/common/middleware/authenticate.js`

**Functionality:**
1. Extracts the raw token from the `noteflow_session` cookie
2. Looks up the session by its SHA-256 hash
3. Rejects missing / revoked / expired sessions with 401
4. Rejects sessions whose user has not verified their email (401 `EMAIL_NOT_VERIFIED`)
5. Attaches `req.userId` and `req.sessionId`, updating `lastUsedAt`

---

## Protected Routes

| Route | Auth Required |
|-------|---------------|
| `/api/v1/me` | Yes (also requires verified email) |
| `/api/v1/notes/*` | Yes (verified email) |
| `/api/v1/notebooks/*` | Yes (verified email) |
| `/api/v1/tags/*` | Yes (verified email) |
| `/api/v1/auth/verify` | Yes |

**Public Routes:**
- `/api/v1/auth/register`
- `/api/v1/auth/login`
- `/api/v1/auth/logout`
- `/api/v1/auth/resend-verification`
- `/api/v1/auth/verify-email`
- `/api/v1/auth/reset-password-code`
- `/api/v1/auth/confirm-password-reset`
- `/api/v1/auth/google`
- `/api/v1/auth/google/callback`

---

## Cookie Behavior (`noteflow_session`)

| Browser Action | Behavior |
|----------------|----------|
| Login / verify-email / Google login | Cookie set with 7-day expiry |
| Register | No cookie (logged out until verified) |
| Session active | Cookie sent on each request |
| Logout | Cookie cleared, sessions revoked |
| Session expired/revoked | 401 returned, client clears user state |

---

## Rate Limiting

| Scope | Limit |
|-------|-------|
| `/auth/*` HTTP | 10 requests per minute |
| All other routes | 100 requests per minute |
| Verification code requests (per email) | 5 per hour |
| Password reset code requests (per email) | 5 per hour |
| Login attempts (per email) | 5 attempts → 15-minute lockout |