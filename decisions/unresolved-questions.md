# Unresolved Questions

## How Are Frontend Autosave Local Keys Named?

**Status:** UNKNOWN

**Why It Matters:**
- Understanding localStorage key naming is important for debugging conflicts
- Multiple notes might use different keys or share one

**Evidence Checked:**
- `frontend/src/hooks/useAutosave.js` - `localKey` parameter exists but value unknown
- `useAutoSave` hook - accepts `localKey` option
- `NotesPage`, `NoteDetailPage` - pass options but key not visible

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check `frontend/src/pages/NoteDetailPage.jsx` for actual `localKey` values
- Search localStorage keys during runtime debugging

---

## What Is the Exact Password Reset Email Template?

**Status:** UNKNOWN

**Why It Matters:**
- Email content affects user experience and branding
- Brevo template configuration may not match code

**Evidence Checked:**
- `backend/src/modules/email/email.service.js` - imports brevo SDK
- Reset codes are sent via `sendPasswordResetEmail`
- No template content in source code

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check Brevo account for email templates
- Look for template IDs or HTML content in environment variables

---

## How Does File Upload Flow to Cloudinary Work?

**Status:** UNKNOWN

**Why It Matters:**
- Avatar images need proper handling
- Cloudinary credentials and transformation settings unknown

**Evidence Checked:**
- `backend/src/middleware/upload.js` - multer configured with diskStorage
- `backend/src/services/avatar.service.js` (if exists) - not fully visible
- Cloudinary package dependencies

**Current Status:** UNKNOWN

**Suggested Verification:**
- Search for `cloudinary` usage in services folder
- Check upload controller for transformation params

---

## Are There Background Jobs or Cron Tasks?

**Status:** UNKNOWN

**Why It Matters:**
- docs/14-background-jobs.md references this
- Important for scheduled tasks (e.g., permanent trash cleanup)

**Evidence Checked:**
- `docs/14-background-jobs.md` file exists
- No cron or background job code in backend/src
- No scheduler package dependencies (bull, Agenda, etc.)

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check deployment scripts for scheduled commands
- Review server startup for any interval/setInterval jobs

---

## Is There User Feedback for Conflict Resolution (409)?

**Status:** UNKNOWN

**Why It Matters:**
- 409 CONFLICT responses exist but UX handling unclear
- Users need to understand why their edit failed

**Evidence Checked:**
- `backend/src/services/notes.service.js` - throws 409 on expectedUpdatedAt mismatch
- `frontend/src/hooks/useAutosave.js` - detects `status === 409`
- `useUpdateNote` hook - doesn't handle conflict specially

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check `NoteDetailPage` for conflict UI (toast/modal)
- Review `useAutosave` hook for onConflict callback

---

## How Are Trashed Notes Permanently Deleted After 30 Days?

**Status:** UNKNOWN

**Why It Matters:**
- docs/11-deployment.md mentions "30 days"
- No scheduled job found in source

**Evidence Checked:**
- `frontend/src/components/layout/AppLayout.jsx` - sidebar says "30 days"
- No cron/background job code in backend
- No `deletedAt` cleanup logic

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check hosting platform scheduled tasks
- Look for separate worker process

---

## What Are the Limits on Notebook and Tag Counts?

**Status:** UNKNOWN

**Why It Matters:**
- UI may have implicit limits (e.g., TagsSection shows "12 max")
- Backend doesn't enforce count limits

**Evidence Checked:**
- `frontend/src/components/sidebars/TagsSection.jsx` - mentions 12 max in UI
- No backend validation on count

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check frontend UI for validation
- Review component render logic

---

## How Are Rate Limit Exceeded Responses Formatted?

**Status:** UNKNOWN

**Why It Matters:**
- 429 responses need clear error messages
- Rate limiting exists but response format unknown

**Evidence Checked:**
- `backend/src/middleware/rateLimit.js` - express-rate-limit configured
- `standardHeaders: true` - returns Retry-After header
- Error response format not verified

**Current Status:** UNKNOWN

**Suggested Verification:**
- Test /auth/register endpoint with rapid requests
- Check response body format

---

## Is There Session Blacklisting on Logout?

**Status:** UNKNOWN

**Why It Matters:**
- POST /auth/logout clears cookie but doesn't invalidate token
- User could potentially reuse token

**Evidence Checked:**
- `backend/src/controllers/auth.controller.js` - clears cookie
- `JWT_SECRET` not rotated on logout
- No blacklist/persistent list mechanism

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check token implementation for blacklist
- Verify if logout truly invalidates session server-side

---

## Are API Responses Paginated or Infinite Scroll?

**Status:** UNKNOWN

**Why It Matters:**
- `useNotes()` supports pagination params
- `useNotesInfinite()` also exists

**Evidence Checked:**
- `frontend/src/hooks/useNotes.js` - both hooks defined
- `NotesPage` uses `useNotes` with `limit=10`
- Pagination controls not clearly visible

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check NotesPage for pagination UI
- Review infinite scroll integration

---

## How Are Error Logs Collected in Production?

**Status:** UNKNOWN

**Why It Matters:**
- Development uses morgan, production doesn't
- Error monitoring strategy not documented

**Evidence Checked:**
- `backend/src/app.js` - morgan only in development
- `backend/src/middleware/arror.js` - global error handler
- No logging service (Winston, LogRocket, etc.)

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check hosting platform logging settings
- Look for external error tracking integration

---

## What Happens to Notebooks/Tags When User Deletes Account?

**Status:** UNKNOWN

**Why It Matters:**
- Account soft-delete sets deletedAt on User
- Cascade delete logic unclear

**Evidence Checked:**
- `backend/src/controllers/me.controller.js` - deleteAccount
- Notebook/Tag models have userId reference
- Mongoose schema doesn't have cascade delete

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check me.service.deleteAccount implementation
- Review if notes/notebooks/tags get cascade deleted

---

## Is There Rate Limiting Per IP or Per User?

**Status:** UNKNOWN

**Why It Matters:**
- express-rate-limit defaults to IP-based
- Auth endpoints should prevent brute force

**Evidence Checked:**
- `backend/src/middleware/rateLimit.js` - uses defaults
- `trust proxy: 1` for behind-load balancer
- No explicit keyGenerator for per-user limits

**Current Status:** UNKNOWN

**Suggested Verification:**
- Test with different IP addresses
- Check if login attempts are tracked per account

---

## How Does the Mobile/Responsive Layout Toggle Work?

**Status:** UNKNOWN

**Why It Matters:**
- UI has collapsible sidebar
- Mobile-specific behavior needs verification

**Evidence Checked:**
- `frontend/src/components/layout/Sidebar.jsx` - has Sheet for mobile
- `use-mobile.jsx` hook exists
- UIStore tracks `sidebarOpen`

**Current Status:** UNKNOWN

**Suggested Verification:**
- Check media queries in Tailwind config
- Review Sidebar component logic
