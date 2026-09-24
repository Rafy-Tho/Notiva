# NoteFlow — Full-Stack Note-Taking Application

> **Version:** 1.0.0 | **Stack:** React 19 + Express 5 + PostgreSQL (Prisma 7)

---

## 1. EXECUTIVE SUMMARY

| Attribute         | Detail                                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project**       | NoteFlow — A modern, fast, rich-text note-taking web app                                                                                                                               |
| **Target**        | Knowledge workers, students, developers                                                                                                                                                |
| **Core Features** | Rich-text editor (TipTap: headings, lists, checklists, links, images, tables, alignment, code blocks), notebooks/tags, pin/favorite/archive/trash, auto-save, ⌘K command palette, full-text search, dark/light theme, focus mode, data export, avatar upload, email verification, password reset, Google login |
| **Auth**          | Opaque server sessions (httpOnly cookie, SHA-256 hashed in PostgreSQL) + Google OAuth 2.0 / OpenID Connect                                                                             |
| **Architecture**  | Two-tier: React SPA (Vite) + Express REST API (Prisma → PostgreSQL)                                                                                                                    |

## 2. TECH STACK

**Frontend:** React 19, Vite 8, Tailwind CSS 3, Zustand 5, TanStack Query 5, React Router 7, TipTap 3, Radix UI, Lucide, cmdk, next-themes, sonner, zod, date-fns, DOMPurify, JSZip + FileSaver, lowlight, immer

**Backend:** Node.js (ESM), Express 5, Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`), bcrypt, express-validator, helmet, cors, cookie-parser, express-rate-limit + rate-limit-redis (ioredis), multer, cloudinary, sanitize-html, ua-parser-js, archiver

**Database:** PostgreSQL  
**Cache / Rate Limiting:** Redis (ioredis)  
**Infrastructure:** Cloudinary (images), Hostinger Mail (email)

**Deployment:** Frontend on Vercel (`https://noteflow.rafytho.com/`), backend on Hostinger (`https://api-noteflow.rafytho.com/`)

---

## 3. FOLDER STRUCTURE

```
backend/
├── prisma/
│   ├── schema.prisma                    # Data model (9 models)
│   └── migrations/
├── scripts/                             # backup.js, restore.js
└── src/
    ├── server.js                        # Entry point
    ├── app/
    │   ├── app.js                       # Express app (helmet, cors, cookies, body parsing, limiter)
    │   ├── routes.js                    # Mounts feature routers under /api/v1
    │   └── health.js                    # HTML health dashboard at GET /
    ├── config/                          # env, cors, cloudinary, redis, limits
    ├── db/prisma.js                     # Shared PrismaClient singleton
    ├── common/
    │   ├── errors/                      # AppError, errors, errorHandler
    │   ├── middleware/                  # authenticate, validate, rateLimiter, httpLogger, securityAudit
    │   └── utils/                       # tokens, response, html, logger, rateLimit
    ├── modules/                         # Feature modules (layered per feature)
    │   ├── auth/                        # register, login, verify-email, reset, sessions, google oauth
    │   ├── users/                       # /me profile, password, avatar
    │   ├── notes/                       # notes CRUD + pin/fav/archive/trash/purge
    │   ├── notebooks/                   # notebook CRUD
    │   ├── tags/                        # tag CRUD
    │   ├── email/                       # Hostinger mail API client
    │   └── upload/                      # multer + Cloudinary
    └── tests/                           # Vitest suites
```

Each feature module follows the same layered pattern:
`*.routes.js` (Express router) → `*.controller.js` (HTTP) → `*.service.js` (business logic) → `*.repository.js` (Prisma) → `*.validation.js` (express-validator).

```
frontend/
└── src/
    ├── main.jsx                         # Entry point
    ├── index.css                        # Tailwind + editor/prose styles
    ├── app/
    │   ├── App.jsx                      # Root: Bootstrap + Providers + Router
    │   ├── providers.jsx                # QueryClient (retry: 0), 401 handler, Sonner toasts
    │   └── routes/index.jsx             # createBrowserRouter route table
    ├── config/                          # api.js (base URL, timeout, retry policy)
    ├── components/
    │   ├── common/                      # CommandPalette, ErrorBoundary, ErrorState, Loading, Logo, Section, NavItem, NameColorForm
    │   ├── layout/                      # AppLayout, AppHeader, Sidebar, SidebarInner
    │   └── ui/                          # shadcn-style primitives (button, dialog, popover, dropdown, sheet, …)
    ├── features/                        # Feature-based organization
    │   ├── auth/                        # pages (Login/Register/Verify-Email/Update-Password/Settings) + PrivateRoute/PublicRoute + useMe
    │   ├── notes/                       # pages (Index, NotesPage, NoteDetailPage, SearchPage) + editor/status-bar components + hooks (useNotes, useNoteEditing, useAutosave) + lib (noteListCache, noteCounts)
    │   ├── notebooks/                   # dialogs/section components + useNotebooks
    │   └── tags/                        # dialogs/section components + useTags
    ├── hooks/                           # useAutosave, useDebounce, useTheme, use-mobile
    ├── lib/                             # fetchWithAuth, sanitize, searchText, colors, utils, offlineQueue, validation, formHooks
    └── store/                           # authStore, useUIStore, useNoteCountsStore (Zustand)
```

---

## 4. FRONTEND ARCHITECTURE

### Routing

```
/login, /register, /verify-email, /update-password   (PublicRoute)
/                                                      → All-notes index      (PrivateRoute → AppLayout)
/notes, /notes/:id
/favorites, /favorites/:id
/archive, /archive/:id
/trash, /trash/:id
/notebooks/:notebookId, /notebooks/:notebookId/:id
/tags/:tagId, /tags/:tagId/:id
/settings
/search
```

- Public routes are lazy-loaded with `<Suspense>`; unauthenticated visitors to private routes are redirected to `/login` (with `state.from` to return after login).
- `/search` and `/notes` are client-side filtered views of the same note data; query params are synced to the URL (shareable).

### State Management

- **Zustand (client state):** `authStore` (user/session lifecycle), `useUIStore` (theme, font size, sidebar, focus mode — persisted to localStorage), `useNoteCountsStore` (sidebar counts).
- **TanStack Query (server state):** all notes/notebooks/tags/profile data with `retry: 0` and 5-minute stale time, optimistic updates with rollback on every mutation, and no refetch on settle.
- **Retry ownership:** `fetchWithAuth` is the single retry owner (timeout 30s, up to 2 retries with backoff for 408/429/5xx), uses `credentials: "include"` for cookie sessions, and fires a global 401 handler (wired in `providers.jsx`) that clears the session.

### Layout

```
AppLayout
├── Sidebar (collapsible, Sheet on mobile)
│   ├── ActionButtons (New note, Search)
│   ├── NavSections (All, Favorites, Archive, Trash)
│   ├── NotebooksSection → NotebookRow (×N)
│   ├── TagsSection → TagRow (×12 max)
│   └── UserSection
├── AppHeader (sidebar toggle, Logo, Search, New, Avatar)
├── <Outlet/> (page content)
└── CommandPalette (⌘K dialog overlay)
```

### Editor

TipTap-based with a full toolbar: block types (paragraph/H1/H2/H3/blockquote/code block), bold/italic/underline/strike, inline code, bullet/numbered/task lists, links (auto-link + popover), images (URL or pasted data URLs), tables (insert/delete row/column, merge/split cells, header row/column), text alignment, and horizontal rule. A status bar shows live word/character counts, reading time and save state, plus a focus-mode (⌘/) toggle that hides all chrome for distraction-free writing.

---

## 5. BACKEND ARCHITECTURE

### API Routes

| Prefix              | Auth     | Rate Limit | Purpose                                                              |
| ------------------- | -------- | ---------- | -------------------------------------------------------------------- |
| `GET /`             | Public   | —          | HTML health dashboard (DB, Redis, email, Cloudinary, Google probes)   |
| `/api/v1/auth`      | Mixed    | 10/min     | register, login, logout, verify email, reset password, Google OAuth   |
| `/api/v1/me`        | Required | —          | profile, password, avatar, delete account                             |
| `/api/v1/notebooks` | Required | —          | CRUD notebooks                                                        |
| `/api/v1/tags`      | Required | —          | CRUD tags                                                             |
| `/api/v1/notes`     | Required | —          | CRUD + pin/fav/archive/trash/purge/restore + counts                   |

Request-scoped limits: verification/password-reset codes are capped at 5/hour per email; login failures lock for 15 minutes after 5 attempts.

### Middleware Chain

```
Request → helmet (incl. CSP) → cors (credentialed, allowed origins) → cookie-parser
→ express.json/urlencoded (1 MB) → request-ID → httpLogger (dev) → generalLimiter (100/min)
→ Route-specific: authenticate | authLimiter (10/min) | validate → Controller → Service → Repository → PostgreSQL
→ notFoundHandler (404) / errorHandler (global)
```

### Auth Flow

- **Opaque server sessions, not JWT.** Each login creates a 32-byte random token delivered in an httpOnly `noteflow_session` cookie (7-day expiry); only its SHA-256 hash is stored in the `UserSession` table, so stolen cookies can be individually revoked. Cookie flags: `secure` + `SameSite=None` in production, `lax`/insecure in development.
- Session restored on app boot via `GET /auth/verify` (deduplicated to once per page load); 401 is treated as permanent and never retried.
- **Email verification required:** registration produces an unverified user + 6-digit code (SHA-256 hashed, 15-minute expiry, single-use). Login and protected routes are blocked until verified; `POST /auth/verify-email` verifies and logs in.
- **Password reset:** 6-digit code (same hashing/expiry rules), consumed on success, and revokes all of the user's sessions. Generic responses prevent email enumeration.
- **Google login:** server-side Authorization Code flow with an httpOnly `oauth_state` cookie, ID-token signature verification against Google JWKS (`iss`/`aud`/`exp`/`email_verified`), and user resolution by Google `sub` (account link or new verified user). Google emails are treated as verified.
- Passwords are bcrypt-hashed (cost 12).

---

## 6. DATABASE MODELS

```
User
├── id (UUID, PK), name, email (unique), password (bcrypt)
├── avatar (Cloudinary URL), emailVerifiedAt, deletedAt (soft delete)
└── createdAt, updatedAt

Notebook
├── id (UUID, PK), name, color, userId (FK → User)
├── @@unique([userId, name])
└── deletedAt (soft delete), createdAt, updatedAt

Tag
├── id (UUID, PK), name, color, userId (FK → User)
├── @@unique([userId, name])
└── deletedAt (soft delete), createdAt, updatedAt

Note
├── id (UUID, PK), title, content (HTML), wordCount
├── userId (FK), notebookId (FK, nullable)
├── isPinned, isFavorite, isArchived
├── deletedAt (soft delete), createdAt, updatedAt
└── Indexes: (userId, updatedAt), (userId, notebookId), (userId, isPinned, updatedAt), (deletedAt)

NoteTag                                # join table
├── noteId (FK → Note), tagId (FK → Tag)
└── @@id([noteId, tagId]), Index (tagId)

AuthAccount                            # OAuth links (e.g. Google)
├── id, userId (FK), provider, providerUserId (Google sub)
└── @@unique([provider, providerUserId])

UserSession                            # opaque session tokens
├── id, userId (FK), tokenHash (unique), deviceName, ipAddress, userAgent
└── expiresAt, lastUsedAt, revokedAt, createdAt, updatedAt

EmailVerificationToken                 # 6-digit email codes
├── id, userId (FK), tokenHash, expiresAt, usedAt, createdAt
└── @@index([userId, tokenHash])

PasswordResetToken                     # 6-digit reset codes
├── id, userId (FK), tokenHash, expiresAt, usedAt, createdAt
└── @@index([userId, tokenHash])
```

**Relationships:** `User 1─< Note/Notebook/Tag/UserSession/AuthAccount/tokens` · `Notebook 1─< Notes` · `Note N─< Tag` via `NoteTag`.

**Soft-delete pattern:** `deletedAt` on `User`, `Note`, `Notebook`, and `Tag`. Trashed notes are retained for 30 days before being purged.

---

## 7. KEY API ENDPOINTS

All under `/api/v1`. Response format: `{ success: bool, data: any, code: string|null, message: string }`

| Method           | Endpoint                                | Auth | Purpose                                 |
| ---------------- | --------------------------------------- | ---- | --------------------------------------- |
| GET              | `/` (no prefix)                         | No   | HTML health dashboard                   |
| POST             | `/auth/register`                        | No   | Create unverified account, send code    |
| POST             | `/auth/login`                           | No   | Sign in (sets session cookie)           |
| POST             | `/auth/logout`                          | No   | Clear cookie, revoke sessions           |
| POST             | `/auth/resend-verification`             | No   | Resend 6-digit email code               |
| POST             | `/auth/verify-email`                    | No   | Verify with code, log in                |
| POST             | `/auth/reset-password-code`             | No   | Send 6-digit reset code                 |
| POST             | `/auth/confirm-password-reset`          | No   | Complete reset with code                |
| GET              | `/auth/verify`                          | Yes  | Restore session                         |
| GET              | `/auth/google`                          | No   | Start Google OAuth sign-in (redirect)   |
| GET              | `/auth/google/callback`                 | No   | Complete Google OAuth sign-in           |
| GET              | `/me`                                   | Yes  | Get profile                             |
| PATCH            | `/me`                                   | Yes  | Update name                             |
| POST             | `/me/password`                          | Yes  | Change password                         |
| POST             | `/me/avatar`                            | Yes  | Upload avatar (multipart)               |
| DELETE           | `/me/avatar`                            | Yes  | Remove avatar                           |
| DELETE           | `/me`                                   | Yes  | Soft-delete account                     |
| GET/POST         | `/notes`                                | Yes  | List (with filters/pagination)/Create   |
| GET/PATCH/DELETE | `/notes/:id`                            | Yes  | Read/Update/Soft-delete note            |
| GET              | `/notes/trash`                          | Yes  | List trashed notes                      |
| GET              | `/notes/counts`                         | Yes  | Note statistics for sidebar             |
| POST             | `/notes/:id/pin`                        | Yes  | Toggle pin                              |
| POST             | `/notes/:id/favorite`                   | Yes  | Toggle favorite                         |
| POST             | `/notes/:id/archive`                    | Yes  | Toggle archive                          |
| POST             | `/notes/:id/restore`                    | Yes  | Restore from trash                      |
| POST             | `/notes/:id/purge`                      | Yes  | Permanent delete                        |
| GET/POST         | `/notebooks`                            | Yes  | List/Create notebooks                   |
| PATCH/DELETE     | `/notebooks/:id`                        | Yes  | Update/Soft-delete notebook             |
| GET/POST         | `/tags`                                 | Yes  | List/Create tags                        |
| PATCH/DELETE     | `/tags/:id`                             | Yes  | Update/Soft-delete tag                  |

---

## 8. KEY USER WORKFLOWS

### Email Verification
```
Register → unverified user created + 6-digit code emailed (SHA-256 hashed, 15-min, single-use)
→ User enters code at /verify-email
→ POST /auth/verify-email validates and consumes the code
→ Server session created + cookie set → user is logged in
(Unverified users cannot log in via password or access protected routes.)
```

### Google Sign-In
```
"Sign in with Google" → GET /auth/google stores oauth_state cookie, redirects to Google consent
→ Callback validates state, exchanges code, verifies ID token via Google JWKS
→ Resolves user by Google sub (link by email or create verified account)
→ Server session created + cookie set → SPA restoreSession() picks it up
(Failures redirect to /login?oauth_error=... — never a JSON error.)
```

### Auto-Save
```
User edits title/content → useAutosave tracks a revisioned draft → 1s debounce
→ PATCH /notes/:id with expectedUpdatedAt
→ Only the newest revision may clear the dirty state
→ Temporary network/server failures retry up to 3 times
→ Navigation can flush before leaving; pagehide/visibilitychange use a best-effort flush
→ Unsaved drafts are retained in localStorage and can be restored after reopening
→ A stale expectedUpdatedAt returns 409 and is shown as a conflict instead of being retried
```

### Session Restore
```
App mounts → Bootstrap calls authStore.restoreSession() (deduplicated per load)
→ GET /auth/verify (sends cookie)
→ 200: set user → PrivateRoute renders AppLayout
→ 401: set user=null → PublicRoute shows Login
```

### Search
```
User types query → SearchPage filters notes client-side
→ Filters by: text, notebook, tag, date range, pinned status
→ Results shown inline + click navigates to /notes/:id
→ Query persisted in URL params (shareable)
```

---

## 9. SECURITY

- Opaque session tokens in httpOnly + secure + SameSite cookies (dev: lax/insecure; prod: none/secure over HTTPS); only SHA-256 hashes stored at rest
- Sessions are individually revocable; password reset/change and account delete revoke all sessions server-side
- bcrypt (cost 12) for passwords
- Email verification required before login and protected routes
- express-validator on all inputs
- sanitize-html (server) + DOMPurify (client) for XSS defense
- Rate limiting: auth (10/min), general (100/min), codes (5/hour per email), login lockout (5 attempts/hour → 15 min)
- Helmet security headers, including a CSP safe for the HTML health page
- CORS restricted to configured origins
- 6-digit verification/reset codes: `crypto.randomInt`, SHA-256 hashed, 15-minute expiry, single-use
- Google OAuth ID tokens verified server-side against Google JWKS (`iss`/`aud`/`exp`/`email_verified`); identity resolved by Google `sub`, never client-provided

---

## 10. QUICK START

Prerequisites: Node.js, PostgreSQL, and Redis.

```bash
# Backend
cd backend
cp .env.example .env  # Fill in DATABASE_URL, JWT_ACCESS_SECRET, Cloudinary, Hostinger mail, Redis, GOOGLE_*
npm install           # postinstall runs `prisma generate`
npx prisma migrate deploy   # apply migrations (or `npx prisma migrate dev`)
npm run dev           # Port 5000 (node --watch src/server.js)

# Frontend
cd frontend
npm install
npm run dev           # Port 5173
```

**Frontend:** `http://localhost:5173`  
**Backend:** `http://localhost:5000` (`GET /` shows the health dashboard)  
**API Base:** `http://localhost:5000/api/v1`

For production, the backend start command is `npm start` (`prisma generate && node src/server.js`) with `NODE_ENV=production` and `FRONTEND_ORIGIN` set to your deployed origin.

---

## 11. Frontend Preview

- Link: [Visit App](https://noteflow.rafytho.com/)

  <img src="noteflow.png">