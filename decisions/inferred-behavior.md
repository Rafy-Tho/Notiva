# Inferred Behavior

## Note Ownership Enforcement

**Status:** INFERRED

**Evidence:**
- All note service methods filter by userId
- `getNote(userId, id)` checks ownership
- `updateNote()` includes userId in filter
- Controllers pass req.userId to services

**Reason:**
The implementation filters all note queries using user ID from JWT, but no explicit authorization documentation was found in the codebase.

**Confidence:** High

---

## Notebooks and Tags Per-User Unique Names

**Status:** INFERRED

**Evidence:**
- Mongoose schema for Notebook: `{ userId, name }` compound unique index
- Same pattern for Tag model
- Validation schemas don't include name uniqueness check

**Reason:**
Database-level unique compound index enforces per-user name uniqueness, but the error handling for duplicate names isn't documented.

**Confidence:** High

---

## Auto-Save Local Draft Persistence

**Status:** INFERRED

**Evidence:**
- `useAutosave` hook writes to localStorage with `localKey` option
- Restores drafts if stored version is newer than serverUpdatedAt
- LocalKey is passed from frontend hooks (not seen in service code)

**Reason:**
Draft persistence exists in frontend hooks but localStorage key naming convention isn't standardized across all note operations.

**Confidence:** Medium

---

## Image Upload to Cloudinary

**Status:** INFERRED

**Evidence:**
- `cloudinary` package in dependencies
- `upload.js` middleware restricts to images, 5MB limit
- Brevo package for email delivery

**Reason:**
Cloudinary configuration isn't visible in source (likely env vars), but infrastructure files and service code suggest cloud storage for user images.

**Confidence:** High

---

## Rate Limiting in Memory

**Status:** INFERRED

**Evidence:**
- `express-rate-limit` and `rate-limit-redis` and `ioredis` installed
- No Redis server setup visible in docker/docker-compose
- rateLimit.js doesn't configure store

**Reason:**
Redis dependencies suggest intended scaling, but actual implementation uses memory-only rate limiting.

**Confidence:** High

---

## Text Search Uses MongoDB Text Indexes

**Status:** INFERRED

**Evidence:**
- NoteSchema has: `title: "text", content: "text"`
- `listNotes()` service uses regex search, not $text operator
- docs/04-data-model.md mentions text indexes

**Reason:**
Text indexes are defined but regex-based search is used instead of MongoDB $text queries.

**Confidence:** High

---

## Avatar Upload Uses Multer + Cloudinary

**Status:** INFERRED

**Evidence:**
- `upload.js` middleware with `diskStorage`
- `avatar` endpoint in `me.routes.js`
- `updateAvatar` controller calls service

**Reason:**
File upload path uses multer for temp storage, then uploads to Cloudinary, but the service chain isn't fully visible.

**Confidence:** High

---

## Page Hide/Visibility Flush for Autosave

**Status:** INFERRED

**Evidence:**
- `useAutosave` registers visibilitychange and pagehide listeners
- Calls `flush({ keepalive: true })` before navigation

**Reason:**
This behavior exists in frontend but isn't documented in README or docs.

**Confidence:** High

---

## Request Validation Chains

**Status:** INFERRED

**Evidence:**
- `express-validator` installed
- Validators in `backend/src/validators/`
- All POST/PATCH routes use `validate()` middleware

**Reason:**
Validation happens at route level but error codes/messages aren't standardized across validators.

**Confidence:** High

---

## Environment-Driven CORS Origins

**Status:** INFERRED

**Evidence:**
- `FRONTEND_ORIGIN` used in `app.js`
- `cors` configured with `origin: origins`
- Split by comma for multiple origins

**Reason:**
CORS configuration is flexible but not documented with examples.

**Confidence:** High

---

## JWT Expiry via Environment Variable

**Status:** INFERRED

**Evidence:**
- `JWT_TTL` used in `tokens.js` with default `7d`
- Not present in documented environment variables

**Reason:**
Token expiration is configurable but not listed in deployment docs.

**Confidence:** High

---

## Error Handler Returns Standard Format

**Status:** INFERRED

**Evidence:**
- `errorHandler` middleware in `arror.js`
- Sets `success: false`, extracts `code` and `message`

**Reason:**
Error wrapping is consistent but documentation shows `code` and `message` as null in success responses when they should be omitted.

**Confidence:** High
