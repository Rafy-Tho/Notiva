# Architectural Decisions

## Token-Based Authentication via HTTP-Only Cookies

**Status:** CONFIRMED  
**Date:** 2024-09-20

JWT tokens stored in httpOnly cookies instead of localStorage.

**Rationale:**
- Mitigates XSS token theft (cookies not accessible via JavaScript)
- SameSite=lax prevents CSRF attacks
- Automatic inclusion in cross-origin requests (credentials: include)
- Server-side token validation via middleware

**Implementation:**
- `signToken()` creates JWT with user sub
- `authRequired` middleware verifies and attaches req.userId
- Cookie name: `noteflow_token`, 7-day TTL
- `secure: true` only in production

---

## User Ownership Model

**Status:** CONFIRMED  
**Date:** 2024-09-20

All resources (notes, notebooks, tags) require `userId` filter in queries.

**Rationale:**
- Enforces data isolation between users
- No explicit role/permission system needed
- Single user per session simplifies auth

**Implementation:**
- All controllers pass req.userId to services
- Services filter all queries by userId
- Returns 404 if resource not found with filter

**Unknowns:**
- Motivation not confirmed by repository evidence.

---

## Soft Delete Pattern with deletedAt

**Status:** CONFIRMED  
**Date:** 2024-09-20

Deleted items have `deletedAt` set to timestamp instead of permanent deletion.

**Rationale:**
- Allows trash/restore functionality
- Preserves audit trail
- Enables batch operations on trashed items

**Implementation:**
- Note.delete(), Notebook.delete(), Tag.delete() set deletedAt
- Trash views filter: `deletedAt: { $ne: null }`
- Active queries filter: `deletedAt: null`
- `DELETE /notes/:id` soft-deletes
- `POST /notes/:id/purge` permanently removes

---

## Autosave with Optimistic Locking

**Status:** CONFIRMED  
**Date:** 2024-09-20

Frontend autosaves with expectedUpdatedAt conflict detection.

**Rationale:**
- Prevents overwrites from concurrent edits
- 1s debounce balances responsiveness and API calls
- Retry logic handles transient network failures
- Local draft persistence survives page reload

**Implementation:**
- `useAutosave` hook with 1s debounce
- PATCH includes `expectedUpdatedAt`
- Server checks `filter.updatedAt = expectedUpdatedAt`
- Returns 409 with NOTE_CONFLICT code if stale
- LocalStorage drafts restore on reload

---

## TipTap Rich Text Editor

**Status:** CONFIRMED  
**Date:** 2024-09-20

TipTap used for WYSIWYG editing with custom extensions.

**Rationale:**
- ProseMirror-based extensible editor
- Supports markdown shortcuts
- Table and code block extensions available
- Content stored as HTML, sanitized on both ends

**Implementation:**
- @tiptap/react, StarterKit, Placeholder, Table, TaskList
- Content sanitized via sanitize-html (server) and DOMPurify (client)
- wordCount computed on server
- Cover with color and emoji for visual organization

---

## API Response Wrapper

**Status:** CONFIRMED  
**Date:** 2024-09-20

All responses wrapped in standardized envelope.

**Rationale:**
- Consistent error handling across client
- Clear success/failure indication
- Additional metadata (code, message) for UX

**Implementation:**
```json
{
  "success": true,
  "data": { ... },
  "code": null,
  "message": null
}
```

Success: `code` and `message` are null
Error: `success: false`, `code` and `message` populated

---

## TanStack Query for Server State

**Status:** CONFIRMED  
**Date:** 2024-09-20

React Query used for caching, invalidation, and mutations.

**Rationale:**
- Automatic caching and refetching
- Mutation invalidation keeps UI fresh
- Query keys enable selective invalidation

**Implementation:**
- `useNotes()`, `useNote()` for queries
- `useCreateNote()`, `useUpdateNote()` for mutations
- OnSuccess invalidates related queries
- QueryClient in App root

---

## Zustand for Client State

**Status:** CONFIRMED  
**Date:** 2024-09-20

Zustand stores for auth and UI preferences.

**Rationale:**
- Simple global state without context
- Persist middleware saves to localStorage
- Devtools for debugging

**Implementation:**
- `authStore` for user/session state
- `useUIStore` for theme, font, sidebar
- `useNoteCountsStore` for sidebar counters
