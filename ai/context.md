# ai/context.md

NoteFlow - Application Overview
================================

Purpose
-------
A full-stack note-taking web application with rich text editing, organizational features (notebooks, tags), search, and user authentication.

Tech Stack
----------
**Frontend:**
- React 19 + JSX
- Vite 8 (build tool)
- React Router 7
- Zustand 5 (state management)
- TanStack Query 5 (server state)
- Tailwind CSS 3
- TipTap 3 (rich-text editor)
- Radix UI (9 primitives)

**Backend:**
- Node.js (ES modules)
- Express 5
- Prisma 7 (PostgreSQL)
- jsonwebtoken + bcrypt
- express-validator
- helmet + cors + express-rate-limit

**Database:**
- PostgreSQL
- Prisma ORM (`@prisma/client` + `@prisma/adapter-pg`)

Architecture
------------
```
Frontend (React)
    ↓
API Client (fetchWithAuth, credentials: "include")
    ↓
HTTP API (/api/v1/*)
    ↓
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

**Frontend Structure:**
- Feature-based organization (`features/notes/`, `features/notebooks/`, `features/tags/`, `features/auth/`)
- Shared components (`components/layout/`, `components/common/`)
- Shared hooks (`hooks/`) and stores (`store/`)

Major Features
--------------
- **Google Login**: OAuth 2.0 / OIDC server-side Authorization Code flow
- **Notes CRUD**: Create, read, update, delete notes with rich text content
- **Notebooks**: Organize notes in notebooks with colors
- **Tags**: Tag-based organization with color coding
- **Search**: Full-text search across note titles and content
- **Rich Editor**: TipTap with tables, code blocks, task lists
- **Trash**: Soft delete with restore capability
- **Profile**: Avatar upload, password management

Database
--------
**Tables:** User, Note, Notebook, Tag, NoteTag (join table), AuthAccount

**Key Fields:**
- User: id (UUID), email (unique), password (bcrypt), avatar
- Note: id (UUID), title, content (HTML), userId, notebookId, wordCount
- Notebook: id (UUID), name (unique per user), color, userId
- Tag: id (UUID), name (unique per user), color, userId
- NoteTag: noteId + tagId (composite PK)

**Patterns:**
- Soft delete via `deletedAt` field on User/Note/Notebook/Tag
- User ownership via `userId` field on all user-specific entities
- Search via case-insensitive `contains` on title/content
- Unique compound constraints: (userId, name) on Notebook and Tag
- API maps NoteTag rows → `tagIds`

Authentication
--------------
- Opaque server-session authentication (no JWT)
- httpOnly cookie `noteflow_session` (7-day expiry); only the SHA-256 hash of the token is stored (`UserSession`)
- Registration creates unverified users and emails a 6-digit verification code (SHA-256 hashed, 15-min expiry, single-use)
- Email verification logs the user in automatically (server session + cookie)
- Login blocks unverified users (401 "Email not verified"); failed-attempt lockout resets on success
- Password reset uses a 6-digit code (SHA-256 hashed, 15-min expiry, single-use); successful reset revokes all sessions
- Google Login: server-side Authorization Code flow; ID token verified against Google JWKS (`iss`/`aud`/`exp`/`email_verified`); Google `sub` stored in `auth_accounts` (never the email); links to the existing user by verified email or creates a new verified user with a random unusable password; `UNIQUE(provider, provider_user_id)` prevents multi-user linking with `P2002` race recovery
- bcrypt password hashing (cost 12)
- 10/min rate limiting on auth endpoints; verification/reset code requests 5/hour per email
- Cookie storage prevents XSS

Authorization
-------------
- User ownership enforced (all queries filter by userId)
- Controllers validate user owns resource before operations
- Notebook/Tag uniqueness scoped to user

External Services
-----------------
- **PostgreSQL**: Primary database
- **Redis (Upstash)**: Rate limiting
- **Cloudinary**: Avatar image hosting
- **Hostinger mail API**: Verification / password reset emails
- **Google**: OAuth 2.0 / OIDC sign-in (optional; `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL`)

Deployment
----------
- Backend: Node.js server (`server.js`)
- Frontend: Vite static build
- Environment vars: DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, HOSTINGER_MAIL_*, CLOUDINARY_*, GOOGLE_* (optional), etc.

Important Constraints
---------------------
- ES modules (`"type": "module"`)
- Cookie-based auth requires `credentials: "include"`
- Standard response format: `{success, data, code, message}`
- Service-layer pattern (business logic in services/)
- Soft-delete pattern (check deletedAt before returning)
- Logging via custom `logger` utility (`src/common/utils/logger.js`, `LOG_LEVEL` env); request logs via `httpLogger` middleware (dev only, `src/common/middleware/httpLogger.js`)
- `GET /` serves an HTML health dashboard (`src/app/health.js`) that pings PostgreSQL (`SELECT 1`), Redis (`ioredis ping`, 1.5s), Hostinger email (`GET /api/v1/me`, read-only), Cloudinary (`api.ping()`), and Google OAuth (OIDC discovery; `Not configured` when `GOOGLE_*` missing) and renders `Operational`/`Degraded`; always HTTP 200, CSP-safe (inline CSS only, no inline scripts)
- No top-level `await` in the server entry graph (LiteSpeed `lsnode` boots via `require()`)
- Async handler wrapper for error handling
- camelCase naming (ESLint enforced)
