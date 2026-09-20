# Evidence Report

## Authentication

| Aspect | Status | Evidence |
|--------|--------|----------|
| User registration | CONFIRMED | `backend/src/routes/auth.routes.js:17`, `backend/src/controllers/auth.controller.js:23`, `backend/src/services/auth.service.js:6` |
| User login | CONFIRMED | `backend/src/routes/auth.routes.js:18`, `backend/src/controllers/auth.controller.js:30`, `backend/src/services/auth.service.js:26` |
| JWT tokens | CONFIRMED | `backend/src/utils/tokens.js`, `backend/src/middleware/auth.js` |
| Cookie-based sessions | CONFIRMED | `backend/src/controllers/auth.controller.js:15-20` (setAuthCookie/clearAuthCookie) |
| Password hashing | CONFIRMED | `backend/src/services/auth.service.js:15`, bcrypt cost 12 |
| Password reset | CONFIRMED | `backend/src/routes/auth.routes.js:19-20`, `backend/src/services/auth.service.js:51-85` |
| Frontend auth store | CONFIRMED | `frontend/src/store/authStore.js` |

## Authorization

| Aspect | Status | Evidence |
|--------|--------|----------|
| Middleware auth check | CONFIRMED | `backend/src/middleware/auth.js` |
| Route protection | CONFIRMED | `backend/src/routes/*.js` (r.use(authRequired)) |
| Data ownership | CONFIRMED | `backend/src/services/notes.service.js:5-86` (userId filtering) |

## Note Management

| Aspect | Status | Evidence |
|--------|--------|----------|
| CRUD operations | CONFIRMED | `backend/src/routes/notes.routes.js`, `backend/src/controllers/notes.controller.js` |
| Pin/favorite/archive | CONFIRMED | `backend/src/routes/notes.routes.js:17-21`, `backend/src/services/notes.service.js:205-215` |
| Soft delete | CONFIRMED | `backend/src/models/Note.js:53`, `backend/src/services/notes.service.js:187-191` |
| Trash/restore | CONFIRMED | `backend/src/routes/notes.routes.js:11,20`, `backend/src/services/notes.service.js:194-198` |
| Full-text search | CONFIRMED | `backend/src/services/notes.service.js:25-31`, MongoDB text index |
| Auto-save | CONFIRMED | `frontend/src/hooks/useAutosave.js` |

## Notebook Management

| Aspect | Status | Evidence |
|--------|--------|----------|
| CRUD operations | CONFIRMED | `backend/src/routes/notebooks.routes.js` |
| Soft delete | CONFIRMED | `backend/src/models/Notebook.js:20-23` |

## Tag Management

| Aspect | Status | Evidence |
|--------|--------|----------|
| CRUD operations | CONFIRMED | `backend/src/routes/tags.routes.js` |
| Soft delete | CONFIRMED | `backend/src/models/Tag.js:15` |

## User Profile

| Aspect | Status | Evidence |
|--------|--------|----------|
| Profile retrieval | CONFIRMED | `backend/src/routes/me.routes.js:1`, `backend/src/controllers/me.controller.js` |
| Avatar upload | CONFIRMED | `backend/src/services/upload.service.js`, `backend/src/routes/me.routes.js:5` |
| Password change | CONFIRMED | `backend/src/services/me.service.js` |

## Rich Text Editor

| Aspect | Status | Evidence |
|--------|--------|----------|
| TipTap integration | CONFIRMED | `frontend/src/editor/NoteEditor.jsx`, `frontend/src/editor/EditorToolbar.jsx` |
| Code blocks | CONFIRMED | `@tiptap/extension-code-block-lowlight` dependency |
| Tables | CONFIRMED | `@tiptap/extension-table*` dependencies |
| Task lists | CONFIRMED | `@tiptap/extension-task-item`, `@tiptap/extension-task-list` |
| Links/images | CONFIRMED | `@tiptap/extension-link`, `@tiptap/extension-image` |

## UI Components

| Aspect | Status | Evidence |
|--------|--------|----------|
| Radix UI | CONFIRMED | `frontend/src/components/` directory |
| Responsive layout | CONFIRMED | `frontend/src/hooks/use-mobile.jsx` |
| Theme switching | CONFIRMED | `frontend/src/hooks/useTheme.js` |

## Security

| Aspect | Status | Evidence |
|--------|--------|----------|
| Helmet headers | CONFIRMED | `backend/src/app.js:16` |
| CORS | CONFIRMED | `backend/src/app.js:17` |
| Rate limiting | CONFIRMED | `backend/src/middleware/rateLimit.js` |
| HTML sanitization | CONFIRMED | `backend/src/utils/sanitize.js`, `frontend/src/lib/sanitize.js` |
| Input validation | CONFIRMED | `backend/src/validators/*.js` |

## File Operations

| Aspect | Status | Evidence |
|--------|--------|----------|
| Image uploads | CONFIRMED | `backend/src/services/upload.service.js`, `backend/src/services/cloudinary.js` |

## Tests

| File | Status | Evidence |
|------|--------|----------|
| `backend/src/services/notes.service.test.js` | CONFIRMED | File exists |
| `frontend/src/hooks/useAutosave.test.js` | CONFIRMED | File exists |

---

## Unknowns

| Feature | Status |
|---------|--------|
| Deployment configuration | UNKNOWN |
| CI/CD pipeline | UNKNOWN |
| Seed data | UNKNOWN |
| Background jobs | UNKNOWN |

## Conflicts

| Issue | Status |
|-------|--------|
| README vs implementation | No conflicts detected |
