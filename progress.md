# Project Progress

## Current Status

The application is implemented and currently in maintenance/development.

Last analyzed: 2026-09-22

## Completed

- User Registration
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

No active development work was identified from the repository.

## Planned

No documented future work was identified.

## Known Issues

All known issues resolved (see `docs/15-known-issues.md` for completion summary).

## Technical Debt

- No session invalidation on logout (JWT not blacklisted)

See `decisions/unresolved-questions.md` for additional unknowns that may represent technical debt.

## Recent Changes

**2026-09-22** - Fixed note saving never reaching the API (frontend):
- `fetchWithAuth` built a hand-rolled `combinedSignal` plain object and passed it as `RequestInit.signal`. Browsers require a real `AbortSignal`, so `fetch` threw a `TypeError` before sending the request. Only the autosave path supplied a signal, so note saves failed silently while signal-less requests worked.
- Replaced it with a real per-attempt `AbortController`, bridging the caller signal via `addEventListener("abort")` and wiring the previously dead 30-second timeout to the same controller.
- Keepalive flushes (pagehide/visibilitychange) no longer bind the caller's abort signal so the request can survive page unload.
- `useAutoSave` now syncs `saveFnRef`, `onSavedRef`, and `enabledRef` after render to avoid stale closures.
- Added `frontend/src/lib/fetchWithAuth.test.js` covering real-signal passing, caller-abort propagation, keepalive behavior, and retry.

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
