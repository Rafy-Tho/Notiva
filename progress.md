# Project Progress

## Current Status

The application is implemented and currently in maintenance/development.

Last analyzed: 2026-09-23

## Completed

- User Registration
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
