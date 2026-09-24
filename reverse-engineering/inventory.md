# Application Inventory

| Field | Value |
|-------|-------|
| **Name** | NoteFlow |
| **Type** | Full-stack note-taking web application |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 3 |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB Atlas (via Mongoose 9) |

## Core Components

| Component | Technology |
|-----------|------------|
| **Rich-text editor** | TipTap 3 (starter-kit, tables, code blocks, links, images, task lists, underline) |
| **UI components** | Radix UI (dialogs, dropdowns, alerts, menus, inputs) |
| **Icons** | Lucide React |
| **State management** | Zustand 5 (authStore, useUIStore) |
| **Server state** | TanStack Query 5 (with devtools) |
| **Routing** | React Router 7 |
| **Forms** | cmdk (command palette) |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |

## Runtime & Tooling

| Category | Tools |
|----------|-------|
| **Frontend runtime** | Node.js (vite dev server) |
| **Backend runtime** | Node.js (native ESM) |
| **Build tools** | Vite 8 (frontend), native Node (backend) |
| **Package managers** | npm |
| **Linting** | ESLint 10 |
| **Testing** | Vitest 5 (both frontend & backend) |

## Entry Points

| Component | Entry |
|-----------|-------|
| **Frontend** | `frontend/src/App.jsx` |
| **Backend** | `backend/src/server.js` |

## Major Directories

| Path | Purpose |
|------|---------|
| `backend/src/` | Express REST API (routes, controllers, services, models, middleware) |
| `frontend/src/` | React SPA (pages, components, editor, hooks, store, lib) |

## Key Features

| Feature | Evidence |
|---------|----------|
| **User accounts** | `/api/v1/auth` routes + User model |
| **Notebook management** | `/api/v1/notebooks` routes + Notebook model |
| **Tag management** | `/api/v1/tags` routes + Tag model |
| **Rich-text notes** | Note model + TipTap editor |
| **Pin/Favorite/Archive** | Note fields + toggle routes |
| **Trash system** | `deletedAt` field + restore/purge routes |
| **Avatar uploads** | Cloudinary service + `/me/avatar` route |
| **Password reset** | Email service + reset token flow |
| **Command palette** | `cmdk` package + UI component |
| **Auto-save** | `useAutosave` hook with optimistic updates |

## Authentication System

| Aspect | Implementation |
|--------|----------------|
| **Token** | JWT via httpOnly cookie (`noteflow_token`) |
| **Duration** | 7 days (configurable via `JWT_TTL`) |
| **Password hashing** | bcrypt (cost 12) |

## Authorization System

| Aspect | Implementation |
|--------|----------------|
| **Model** | Resource-based (userId ownership) |
| **Enforcement** | All CRUD routes require auth; userId checked on each query |

## External Services

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Primary database |
| **Cloudinary** | Avatar uploads |
| **Hostinger mail API** | Email delivery |

## Background Jobs

None implemented. Email sending is synchronous.

## Testing System

| Framework | Location |
|-----------|----------|
| **Vitest** | `backend/src/services/notes.service.test.js`, `frontend/src/hooks/useAutosave.test.js` |

## Deployment Platform

Not explicitly configured. README mentions `https://notiva-new-2026.onrender.com/`.

## Configuration System

| Type | Location |
|------|----------|
| **Environment** | `.env` files (dotenv) |
| **Frontend** | `import.meta.env.VITE_*` |
| **Backend** | `process.env.*` |

## Repository Structure

```
├── backend/
│   └── src/
│       ├── config/         # Database, Cloudinary, rate limits, mailer
│       ├── controllers/    # Request/response handling
│       ├── middleware/     # auth, rateLimit, validate, upload, errorHandler
│       ├── models/         # User, Note, Notebook, Tag (Mongoose)
│       ├── routes/         # auth, me, notes, notebooks, tags
│       ├── services/       # Business logic
│       ├── utils/          # JWT, response helpers, HTML sanitization
│       └── validators/     # express-validator chains
├── frontend/
│   └── src/
│       ├── components/     # layout, note, search, sidebars, ui
│       ├── editor/         # NoteEditor, EditorToolbar (TipTap)
│       ├── hooks/          # useAuth, useNotes, useAutosave, etc.
│       ├── lib/            # fetch helpers, utils, sanitize
│       ├── pages/          # auth, Index, Notes, NoteDetail, Settings, Search
│       ├── store/          # authStore, useUIStore, useNoteCountsStore
│       └── App.jsx         # Root component
├── task.md
└── README.md
```

---

## Unknowns

| Item | Status |
|------|--------|
| Deployment platform | INFERRED from README URL |
| CI/CD configuration | UNKNOWN |
| Seed data | UNKNOWN |
