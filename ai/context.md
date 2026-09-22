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
- **Notes CRUD**: Create, read, update, delete notes with rich text content
- **Notebooks**: Organize notes in notebooks with colors
- **Tags**: Tag-based organization with color coding
- **Search**: Full-text search across note titles and content
- **Rich Editor**: TipTap with tables, code blocks, task lists
- **Trash**: Soft delete with restore capability
- **Profile**: Avatar upload, password management

Database
--------
**Tables:** User, Note, Notebook, Tag, NoteTag (join table)

**Key Fields:**
- User: id (UUID), email (unique), password (bcrypt), avatar
- Note: id (UUID), title, content (HTML), userId, notebookId, coverColor/coverEmoji, wordCount
- Notebook: id (UUID), name (unique per user), color, userId
- Tag: id (UUID), name (unique per user), color, userId
- NoteTag: noteId + tagId (composite PK)

**Patterns:**
- Soft delete via `deletedAt` field on User/Note/Notebook/Tag
- User ownership via `userId` field on all user-specific entities
- Search via case-insensitive `contains` on title/content
- Unique compound constraints: (userId, name) on Notebook and Tag
- API maps `coverColor`/`coverEmoji` → `cover`, and NoteTag rows → `tagIds`

Authentication
--------------
- JWT cookie-based authentication
- httpOnly cookie `noteflow_token` (7-day expiry)
- HS256 algorithm
- bcrypt password hashing (cost 12)
- 10/min rate limiting on auth endpoints
- Cookie storage prevents XSS

Authorization
-------------
- User ownership enforced (all queries filter by userId)
- Controllers validate user owns resource before operations
- Notebook/Tag uniqueness scoped to user

External Services
-----------------
- **PostgreSQL**: Primary database
- **Cloudinary**: Avatar image hosting
- **Brevo (Sendinblue)**: Password reset emails

Deployment
----------
- Backend: Node.js server (`server.js`)
- Frontend: Vite static build
- Environment vars: DATABASE_URL, JWT_ACCESS_SECRET, CLOUDINARY_*, BREVO_*, etc.

Important Constraints
---------------------
- ES modules (`"type": "module"`)
- Cookie-based auth requires `credentials: "include"`
- Standard response format: `{success, data, code, message}`
- Service-layer pattern (business logic in services/)
- Soft-delete pattern (check deletedAt before returning)
- Async handler wrapper for error handling
- camelCase naming (ESLint enforced)
