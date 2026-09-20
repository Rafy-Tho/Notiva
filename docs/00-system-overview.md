# NoteFlow — System Overview

## What is NoteFlow?

NoteFlow is a modern, full-stack note-taking web application designed for knowledge workers, students, and developers. It provides a rich-text editing experience with organizational features like notebooks, tags, and various filtering options.

## Problem Solved

NoteFlow addresses the need for:
- **Structured note-taking** with rich-text formatting capabilities
- **Organization** through notebooks and tag systems
- **Quick access** via search and command palette (⌘K)
- **Data preservation** with automatic saving and trash/restore functionality
- **Cross-device synchronization** through cloud-hosted database

## Major Users

| User Type | Primary Use Case |
|-----------|------------------|
| Students | Lecture notes, research organization |
| Developers | Code snippets, technical documentation |
| Knowledge workers | Meeting notes, project tracking |

## Major Capabilities

| Feature | Description |
|---------|-------------|
| Rich-text editing | TipTap-based editor with tables, code blocks, task lists |
| Note organization | Notebooks and tags for categorization |
| Pin/Favorite/Archive | Priority-based note management |
| Trash system | Soft-delete with restore capability |
| Full-text search | Search across note titles and content |
| Auto-save | Debounced, optimistic-save updates |
| Avatar uploads | Profile customization via Cloudinary |
| Password reset | Secure email-based recovery flow |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React SPA)              │
│  Vite 8 • React 19 • Tailwind CSS 3 • Zustand 5    │
│  TanStack Query 5 • React Router 7 • TipTap 3      │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    Backend (Express API)             │
│  Node.js • Express 5 • Mongoose 9 • bcrypt  │
│  jsonwebtoken • express-validator • helmet • cors  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   Database & Services                │
│  MongoDB Atlas • Cloudinary • Brevo (Email)        │
└─────────────────────────────────────────────────────┘
```

## Database

**MongoDB Atlas** with Mongoose ODM. Collection schema:
- `users` - User accounts with hashed passwords
- `notes` - Rich-text notes with ownership (userId)
- `notebooks` - Note categorization
- `tags` - Note tagging system

All collections support soft-delete via `deletedAt` field.

## External Services

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| MongoDB Atlas | Primary database | Mongoose connection |
| Cloudinary | Image hosting (avatars) | `/me/avatar` endpoint |
| Brevo | Email delivery | Password reset emails |

## Major System Flow

```
User Browser                    Backend Server                  Database
   │                                   │                              │
   │ 1. GET /auth/verify               │                              │
   │──────────────────────────────────>│                              │
   │                                   │ 2. Verify JWT cookie        │
   │                                   │────────────────────────────>│
   │                                   │<────────────────────────────│
   │                                   │ 3. Return user data         │
   │◄──────────────────────────────────│                              │
   │                                   │                              │
   │ 4. GET /notes                     │                              │
   │──────────────────────────────────>│                              │
   │                                   │ 5. Filter by userId         │
   │                                   │────────────────────────────>│
   │                                   │<────────────────────────────│
   │                                   │ 6. Return filtered notes    │
   │◄──────────────────────────────────│                              │
```

## Security Highlights

- HTTP-only, sameSite=lax JWT cookies (7-day expiry)
- bcrypt hashing (cost 12) for passwords
- HTML sanitization on both client (DOMPurify) and server (sanitize-html)
- Rate limiting (10/min auth, 100/min general)
- Helmet security headers
- CORS restricted to configured origins
