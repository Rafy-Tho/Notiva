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
- Mongoose 9
- jsonwebtoken + bcrypt
- express-validator
- helmet + cors + express-rate-limit

**Database:**
- MongoDB Atlas
- Mongoose ODM

Architecture
------------
```
Frontend (React)
    ↓
API Client (fetchWithAuth, credentials: "include")
    ↓
HTTP API (/api/v1/*)
    ↓
Routes → Controllers → Services → Database (MongoDB/Mongoose)
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
**Collections:** User, Note, Notebook, Tag

**Key Fields:**
- User: email (unique), password (bcrypt), avatar
- Note: title, content (HTML), userId, notebookId, tagIds, isPinned/isFavorite/isArchived, cover, wordCount
- Notebook: name (unique per user), color, userId
- Tag: name (unique per user), color, userId

**Patterns:**
- Soft delete via `deletedAt` field on all collections
- User ownership via `userId` field on all user-specific entities
- Text indexes on Note.title and Note.content
- Unique compound indexes: (userId, name) on Notebooks and Tags

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
- **MongoDB Atlas**: Primary database
- **Cloudinary**: Avatar image hosting
- **Brevo (Sendinblue)**: Password reset emails

Deployment
----------
- Backend: Node.js server (`server.js`)
- Frontend: Vite static build
- Environment vars: MONGO_URI, JWT_SECRET, CLOUDINARY_*, BREVO_*, etc.

Important Constraints
---------------------
- ES modules (`"type": "module"`)
- Cookie-based auth requires `credentials: "include"`
- Standard response format: `{success, data, code, message}`
- Service-layer pattern (business logic in services/)
- Soft-delete pattern (check deletedAt before returning)
- Async handler wrapper for error handling
- camelCase naming (ESLint enforced)
