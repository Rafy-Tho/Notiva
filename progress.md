# Project Progress

## Current Status

The application is implemented and currently in maintenance/development.

Last analyzed: 2026-09-23

## Completed

- User Registration
- Google Login (OAuth 2.0 / OpenID Connect, server-side Authorization Code flow)
- Email Verification (6-digit code, auto-login)
- User Login
- User Logout
- Password Reset
- Note Creation
- Note Editing
- Note Deletion (soft delete and permanent purge)
- Note Organization (notebooks, tags, pin, favorite, archive)
- Note Search
- Note Trash System (30-day retention)
- PostgreSQL/Prisma persistence (migrated from MongoDB/Mongoose)
- Notebook Management
- Tag Management
- Avatar Upload
- Profile Management
- Password Change
- Command Palette
- Theme Switching
- Error Boundaries (global + route-level)
- TanStack Query Retry Configuration
- Query Error UI (NotesPage + NoteDetailPage)
- Route Error Handling (404 + generic errors)
- Optimistic Updates with Rollback (pin, favorite, archive, delete)
- Server-Side Validation Error Integration
- Consistent API Client Usage (auth hooks)

## In Progress

No in-progress work.

## Planned

No documented future work was identified.

## Known Issues

All known issues resolved (see `docs/15-known-issues.md` for completion summary).

## Technical Debt

- None outstanding for auth. Logout revokes the presented session server-side when authenticated; prior sessions from before this change remain valid until expiry.

See `decisions/unresolved-questions.md` for additional unknowns that may represent technical debt.

## Recent Changes

**2026-09-23** - Fixed Google avatar image not rendering on first login (needed manual reloads):
- Root cause: Radix `AvatarImage` treats a failed image preload as terminal (`error` status) with no retry; no `referrerPolicy` was passed, and Google `lh3.googleusercontent.com` URLs can 403 based on `Referer`/fail on the first fresh-load request. Result: blank/initials avatar until a manual full reload happened to succeed
- `ui/avatar.jsx` `AvatarImage` now defaults to `referrerPolicy="no-referrer"` and auto-retries up to 2 times (backoff) on load error by remounting the image with a fresh key, so the avatar appears on first login without manual reloads
- Verified: frontend lint + build pass

**2026-09-23** - Fixed user avatars not rendering in the frontend after Google login:
- `user.repository.js` `create()` now passes through `emailVerifiedAt`/`avatar` (Google users persisted verified with avatar)
- Frontend: `UserSection.jsx` (sidebar) now renders `AvatarImage` (previously only initials), and `AppHeader.jsx`/`SettingsPage.jsx` avatars always render the fallback alongside the image so a failing image degrades to initials instead of a blank circle
- Verified: backend oauth tests (8/8), frontend build + lint pass

**2026-09-23** - Fixed new Google users being saved as email-unverified:
- Root cause: `src/modules/users/user.repository.js` `create()` destructured only `{ name, email, password }`, silently dropping the `emailVerifiedAt`/`avatar` fields that `oauth.service.js` passes on new-user creation. Result: new Google users were persisted with `emailVerifiedAt = NULL`, so `authenticate.js` rejected their fresh session with `EMAIL_NOT_VERIFIED` and the login appeared to fail
- Fixed `user.repository.js:create()` to pass through optional `emailVerifiedAt` and `avatar`; backward compatible with password registration
- Added `ensureVerified(user)` after re-fetch in the P2002 race-recovery path of `oauth.service.js` so a race-recovered user is also ensured verified
- Verified via `backend` oauth.service tests (8/8 pass)

**2026-09-23** - Replaced morgan with a custom logger (also fixes LiteSpeed boot crash on Hostinger):
- Added `src/common/utils/logger.js` (zero-dep, levels debug/info/warn/error, threshold via `LOG_LEVEL` env, ISO timestamps, Error→stack)
- Added `src/common/middleware/httpLogger.js` (dev-only request logger: `METHOD path status - ms`, 4xx→warn, 5xx→error)
- Removed the top-level `await import("morgan")` in `src/app/app.js` (the module graph now has no top-level await, so Hostinger LiteSpeed `lsnode`, which boots via `require()`, no longer throws `ERR_REQUIRE_ASYNC_MODULE`)
- Migrated all 14 `console.*` call sites in `src/` (server, prisma, redis, errorHandler, securityAudit, email.service, auth/oauth controllers) to the logger
- Deleted orphaned legacy `src/app.js` (dead duplicate with broken imports) and removed the `morgan` dependency (deps + devDeps + lockfile)
- Updated README/docs (`03-architecture`, `08-security`, `11-deployment`, `12-environment`, `reverse-engineering/dependencies`, `decisions/unresolved-questions`, `ai/context.md`), added `LOG_LEVEL` to `.env.example`

**2026-09-23** - Fixed Prisma deploy crash (`SyntaxError: The requested module '@prisma/client' does not provide an export named 'PrismaClient'`):
- Root cause: the Prisma client was never generated in the deployed environment, so `@prisma/client` exposed no `PrismaClient` (the import in `src/db/prisma.js` depends on `prisma generate` output in `node_modules/.prisma/client`; locally it existed, hence dev worked)
- Added `"postinstall": "prisma generate"` to `backend/package.json` so generation runs on every `npm install`/`npm ci` (local + Render)
- Changed `"start"` to `prisma generate && node src/server.js` so the client is regenerated before every boot (covers Hostinger cPanel, which has no separate build command — only `npm start`)
- Updated `docs/11-deployment.md`: Hostinger sets the start script to `npm start` (env vars must exist in the panel before first start, since `prisma generate` resolves `DATABASE_URL` via `backend/prisma.config.js`); Render uses Build `npm install && npx prisma generate` + Start `npm start` with **Clear build cache** when a stale client was cached
- Verified end-to-end locally: removed `node_modules/.prisma/client`, ran `npm install` (postinstall regenerated the client), then confirmed `npm start` regenerates the client and boots ("Connected to PostgreSQL", "Server running on port 5000")

**2026-09-23** - Improved UX for loading states to match the NoteFlow design system:
- Added shared `Loading` component (`frontend/src/components/common/Loading.jsx`) with a `Loader2` spinner (`text-primary`) and optional label
- Replaced unimported/undefined `<Loading/>` usage in `routes/index.jsx` Suspense fallbacks with the shared component (fixes latent ReferenceError on lazy route loads)
- Branded the auth-restore bootstrap screen in `App.jsx` with the `Logo` mark and "Restoring session…" spinner
- Replaced bare `Loading...` divs in `TagsSection` and `NotebooksSection` with `SectionHeader` + `Skeleton` rows

**2026-09-23** - Fixed Google login not restoring the session after the OAuth callback redirect:
- `restoreSession` only called `/auth/verify` when localStorage already claimed a logged-in user, so redirect-based Google login (which never populates local state) left the user logged out — `PrivateRoute` bounced `/` to `/login` despite a valid server session and cookie
- `restoreSession` is now unconditional: it always verifies the session cookie on app mount (success → save user, failure → clear local state); added an `isRestoring` flag so `Bootstrap` shows the full-screen loader until the check resolves (prevents a login-page flash after the callback redirect; email-login button spinner unaffected)

**2026-09-23** - Added Google Login (OAuth 2.0 / OpenID Connect) without replacing the existing email/password auth:
- Added `auth_accounts` table (Prisma `AuthAccount` model, migration `20260923044551_add_auth_accounts`): `provider` + `provider_user_id` (Google `sub`, never email) with a unique constraint so one Google account cannot link to multiple users
- Server-side Authorization Code flow, implemented with Node built-in `fetch` + `node:crypto` (no new dependencies): `GET /auth/google` (sets an httpOnly `oauth_state` cookie and redirects to Google) and `GET /auth/google/callback` (validates state, exchanges the code, verifies the ID token signature against Google JWKS with `iss`/`aud`/`exp`/`email_verified` checks)
- User resolution: linked-account login → existing-user-by-email link (marks email verified if unverified, never touches the password) → new verified user creation with a random unusable bcrypt password; Google email is treated as verified
- Race safety: `P2002` recovery re-reads the winning account on concurrent link attempts; soft-deleted users are rejected; cancelled/invalid callbacks redirect to `/login?oauth_error=...`
- Reuses the existing `createSession`/`noteflow_session` cookie flow (exported `buildSessionContext`); Google creds (`GOOGLE_CLIENT_ID`/`SECRET`/`CALLBACK_URL`) are optional env vars so existing deployments are unaffected
- Frontend: "Sign in with Google" button on the login page plus `?oauth_error` toast handling
- Added `backend/src/tests/oauth.service.test.js` (8 vitest cases); docs updated (`docs/05-api.md`, `04-data-model.md`, `06-authentication.md`, `12-environment.md`, `13-integrations.md`), new `specs/auth/google-login.md`, `ai/context.md`, `backend/.env.example`

**2026-09-23** - Fixed Hostinger email delivery (register/reset emails 500'd):
- Corrected the `email.service.js` payload to match Hostinger's `V1.Send.Request` schema: `to` is now an array of email strings (was array of objects), `sender` object removed, `textContent`/`htmlContent` renamed to `text`/`html`, and display name sent via `displayName` (from `MAIL_FROM_NAME`). The old payload was rejected with `400 Bad Request`, failing `/auth/register`
- Success is handled as `204 No Content` (no body), so the previous `res.json()` body parse no longer throws
- Added resilience borrowed from the reference Hostinger setup: 10s request timeout (AbortController), 3 attempts with jittered exponential backoff (300ms→5s cap), honors `Retry-After`, retries only timeout/network/429/5xx; client errors (400/401/403/404/422) are permanent and never retried
- Errors now carry metadata only (`statusCode`, `code`, `retryAfterMs`, `correlationId`); logs never include recipients, codes, or email content
- Email send is now non-fatal for `/auth/register` and password-reset requests (failure is logged but the endpoint still returns success; `/verify-email/resend` still fails loudly); dropped unused `userId` arg from send helpers
- Added `backend/src/tests/email.service.test.js` (7 vitest cases: payload shape, 204, permanent 400, retry on 5xx/429, Retry-After, timeout) — full backend suite passes (18 tests)
- Updated `docs/13-integrations.md` with the correct payload schema and failure/recovery behavior

**2026-09-23** - Fixed broken auth flow (email verification + session handling):
- Registration now creates an unverified user and sends a 6-digit email verification code; it no longer auto-creates a session/cookie for unverified users
- Registering an email that exists but is unverified reuses the account (password unchanged) and resends the code; verified duplicates return 409
- Verification codes are generated with `crypto.randomInt`, SHA-256 hashed, expire in 15 minutes, and are single-use (`usedAt`)
- Tokens are now scoped per user: dropped the global unique constraint on `token_hash` for both token tables and added `@@index([userId, tokenHash])` (migration `20260923020000_scope_code_hashes_per_user`); lookups (`findByUserIdAndTokenHash`) prevent 6-digit hash collisions and removed an empty `catch` that silently swallowed token-insert failures
- Successful email verification now creates the normal server session and sets the `noteflow_session` cookie, logging the user in without password re-entry (`verifyCode` records real device/IP/UA)
- Login now rejects unverified users with `401 Email not verified`; the failed-attempt lock counter resets after a successful login
- Password reset: unknown/unverified emails return a generic response (no token, no email) to prevent enumeration; successful reset consumes the code and revokes all of the user's existing sessions
- Resend verification-code endpoint enforces per-email rate limiting (5/hour)
- Frontend: fixed `useLocation` imported from `react` (crashed the verification page), registration passes email to `/verify-email` and no longer persists an unauthenticated user (which previously bounced `PublicRoute` away), store `isLoading`/`isAuthenticated` now stay in sync, removed dead auth barrel exports
- Docs/specs updated: `docs/05-api.md`, `docs/04-data-model.md`, `docs/06-authentication.md`, `specs/auth/registration.md`, new `specs/auth/email-verification.md`, `specs/auth/login.md`, `specs/auth/password-reset.md`

**2026-09-23** - Removed legacy link-based password reset flow:
- Removed `resetToken` and `resetTokenExpires` fields from the User model (reset tokens now live solely in the PasswordResetToken table)
- Dropped `/auth/forgot-password` and `/auth/reset-password` endpoints, controllers, services (`createResetToken`, `consumeResetToken`), and validations (`forgotV`, `resetV`)
- Removed `setResetToken`, `clearResetToken`, `findByResetToken` from `user.repository.js` and `sendResetEmail` from `email.service.js`
- Removed frontend `ForgotPasswordPage` and `ResetPasswordPage`; kept the 6-digit code flow (`/update-password`, `/auth/reset-password-code`, `/auth/confirm-password-reset`)
- Retargeted LoginPage "Forgot?" link to `/update-password`
- Added Prisma migration `20260923011754_remove_user_reset_token_fields`

**2026-09-22** - Implemented email verification and password reset with 6-digit codes:
- Added `emailVerifiedAt` field to User model
- Created EmailVerificationToken and PasswordResetToken tables with hashed tokens
- Implemented `email_verification.repository.js` and `password_reset.repository.js`
- Added verification services: `sendVerificationCode`, `verifyCode`, `sendPasswordResetCode`, `resetPasswordWithCode`
- Added auth endpoints: `/resend-verification`, `/verify-email`, `/reset-password-code`, `/confirm-password-reset`
- Updated authentication middleware to block unverified users from protected routes
- Updated frontend: `RegistrationVerificationPage`, `UpdatePasswordPage`, auth store methods
- Updated registration flow to redirect to email verification
- Added rate limiting for code requests (5 per hour)
- Tokens expire in 15 minutes and are single-use

**2026-09-22** - Fixed note saving never reaching the API (frontend):
- `fetchWithAuth` built a hand-rolled `combinedSignal` plain object and passed it as `RequestInit.signal`. Browsers require a real `AbortSignal`, so `fetch` threw a `TypeError` before sending the request. Only the autosave path supplied a signal, so note saves failed silently while signal-less requests worked.
- Replaced it with a real per-attempt `AbortController`, bridging the caller signal via `addEventListener("abort")` and wiring the previously dead 30-second timeout to the same controller.
- Keepalive flushes (pagehide/visibilitychange) no longer bind the caller's abort signal so the request can survive page unload.
- `useAutoSave` now syncs `saveFnRef`, `onSavedRef`, and `enabledRef` after render to avoid stale closures.
- Added `frontend/src/lib/fetchWithAuth.test.js` covering real-signal passing, caller-abort propagation, keepalive behavior, and retry.

**2026-09-23** - Removed the note cover feature (coverColor/coverEmoji):
- Dropped `coverColor` and `coverEmoji` columns from the `Note` model (Prisma schema + migration)
- Removed the `cover: { color, emoji }` mapping from `toNoteResponse`, the `cover` write in `createNote`/`updateNote`, and the `cover` validation rules
- Removed the frontend icon/cover UI (EmojiPicker popover, cover color picker, cover banner, card emoji) and the `emoji-picker-react` dependency
- Updated docs, reverse-engineering notes, ai/ context, and tests

**2026-09-22** - Fixed lazy-loaded route crash (frontend):
- Seven page modules imported via `React.lazy` lacked default exports, so `module.default` was `undefined` and React logged the lazy resolution warning with the ES module namespace object (null prototype), producing `TypeError: Cannot convert object to primitive value` in the React DevTools console hook and crashing the route tree
- Added `export default` to `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `SettingsPage`, `NotesPage`, and `NoteDetailPage`, matching the existing pattern in `Index.jsx` and `SearchPage.jsx`

**2026-09-22** - Migrated persistence from MongoDB/Mongoose to PostgreSQL/Prisma:
- Replaced Mongoose models with Prisma schema (User, Note, Notebook, Tag, NoteTag)
- Converted all repositories to Prisma queries via a shared client (`src/db/prisma.js`)
- Converted auth/user/note/notebook/tag services and removed direct DB access from services
- Normalized `tagIds` array into the `NoteTag` relation; API still returns `tagIds`
- Mapped `coverColor`/`coverEmoji` back to the `cover` object at the service boundary
- Replaced `isMongoId` validation with `isUUID`
- Mapped Prisma errors to the existing AppError/error envelope
- Rewrote backup/restore scripts for PostgreSQL; removed Mongoose dependency
- Updated docs (architecture, data model, environment, backup) and ai/ notes

**2025-09-20** - Resolved all 12 known issues:
- Added backup/restore scripts and recovery documentation
- Implemented security audit logging for auth events
- Configured Redis for rate limiting
- Fixed password validation to accept Unicode special characters
- Migrated text search from regex to `$text` operator
- Updated API documentation for response envelope and cookie behavior
- Added account deleted error code
- Added rate limit bypass for health checks and trusted IPs
- Changed frontend limit from 10 to 20 to match docs
- Documented avatar removal endpoint

## Next Steps

1. **Backup Strategy** (HIGH priority): Implement and document database backup/recovery process
2. **Audit Logging** (MEDIUM priority): Add logging for security-relevant events
3. **Search Optimization** (LOW priority): Migrate from regex to text index-based search
4. **Redis Integration** (LOW priority): Configure Redis-backed rate limiting for horizontal scaling
5. **Documentation** (LOW priority): Add missing documentation (avatar removal endpoint, API response format)

## Living Document Rule

This document should be updated whenever:
- New features are implemented
- Features are completed or changed
- Known issues are resolved or new ones are discovered
- Technical debt is addressed
- Planned work is identified or completed
