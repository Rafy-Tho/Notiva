# AGENTS.md

# NoteFlow - Note-Taking Application

## Project

A full-stack note-taking web application with rich text editing, notebooks, tags, and search functionality. Built with React (frontend) and Node.js/Express (backend), using MongoDB for storage.

## Repository Structure

```
note-taking-app-4/
├── backend/              # Node.js/Express API
│   └── src/
│       ├── app/
│       │   ├── app.js
│       │   └── routes.js
│       ├── config/       # Centralized configuration
│       ├── modules/      # Feature modules (auth, users, notes, notebooks, tags)
│       │   ├── auth/
│       │   ├── users/
│       │   ├── notes/
│       │   ├── notebooks/
│       │   ├── tags/
│       │   └── email/
│       ├── common/       # Shared infrastructure
│       │   ├── errors/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── constants/
│       ├── models/       # Mongoose schemas
│       ├── tests/        # Unit and integration tests
│       └── server.js
├── frontend/             # React SPA
│   └── src/
│       ├── app/
│       │   ├── App.jsx
│       │   ├── routes.jsx
│       │   └── providers.jsx
│       ├── config/
│       │   └── env.js
│       ├── features/
│       │   ├── notes/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── pages/
│       │   ├── notebooks/
│       │   │   ├── components/
│       │   │   └── hooks/
│       │   ├── tags/
│       │   │   ├── components/
│       │   │   └── hooks/
│       │   └── auth/
│       │       ├── components/
│       │       └── pages/
│       ├── components/
│       │   ├── common/
│       │   └── layout/
│       ├── hooks/
│       ├── lib/
│       ├── store/
│       └── main.jsx
├── docs/                 # System documentation
├── specs/                # Feature specifications
├── reverse-engineering/  # Evidence-based analysis
└── decisions/            # Architecture decisions
```

## Architecture

**Frontend:** React 19 + Vite 8 + Router 7 + Zustand 5 + TanStack Query 5 + Tailwind CSS + TipTap Editor

**Backend:** Node.js (ESM) + Express 5 + Mongoose 9 + JWT auth + express-validator + helmet

**Data Flow:**

```
Frontend
    ↓
API Client (fetchWithAuth with credentials: "include")
    ↓
HTTP API (/api/v1/*)
    ↓
Routes
    ↓
Controllers
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Database (MongoDB via Mongoose)
```

## Source of Truth

Before making any changes, the agent MUST inspect:

1. **source code** - Implementation details in backend/src/modules/, backend/src/common/, backend/src/app/
2. **tests** - backend/src/tests/notes.service.test.js (current test coverage)
3. **database** - Mongoose models in backend/src/models/
4. **docs/** - System documentation in docs/ (especially 03-architecture.md, 04-data-model.md, 05-api.md)
5. **progress.md** - Current project progress and status
6. **specs/** - Feature specifications in specs/ (auth/, notes/, notebooks/, tags/, profile/)

## Rules

The agent MUST:

- Understand existing behavior before changing it
- Avoid unnecessary refactoring
- Preserve existing APIs (paths, response format, status codes)
- Preserve database compatibility (schemas, indexes, soft-delete pattern)
- Follow existing architecture (service-layer pattern)
- Follow existing naming conventions (camelCase, ESLint rules)
- Run relevant tests after changes
- Update documentation in docs/ when behavior changes
- Update specs in specs/ when feature behavior changes
- Update ai in ai/ when behavior changes
- Update progress.md when implementing changes or resolving issues

## Safety

The agent MUST NOT:

- Invent APIs without specification
- Invent database fields without schema updates
- Remove features without explicit instruction
- Rewrite architecture unnecessarily
- Change authentication without understanding cookie-based JWT flow
- Modify production configuration without instruction
- Expose secrets (tokens, API keys)

## Final AGENT RULE

When given a task, DO NOT immediately edit code.

First determine:

1. What feature is changing?
2. Where is it implemented?
3. What spec describes it?
4. What database/API behavior is involved?
5. What could break?
6. What tests exist?

Then make the smallest appropriate change.
