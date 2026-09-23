# NoteFlow — Data Model

Persistence is PostgreSQL, accessed through Prisma (`backend/prisma/schema.prisma`).
All primary keys are UUIDs (`String @id @default(uuid())`).

## Entities

### User
**Table:** `User`

**Purpose:** Application user accounts

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | Yes | `uuid()` | Primary key |
| `name` | String | Yes | | User display name |
| `email` | String | Yes | | Unique, stored lowercase |
| `password` | String | Yes | | bcrypt hash (cost 12) |
| `avatar` | String | No | | Cloudinary URL |
| `emailVerifiedAt` | Timestamp | No | null | Set when email is verified |
| `deletedAt` | Timestamp | No | null | Soft delete marker |
| `createdAt` | Timestamp | Yes | `now()` | |
| `updatedAt` | Timestamp | Yes | `@updatedAt` | |

**Constraints / Indexes:**
- `email` (unique)

**Related tables:**
- `PasswordResetToken` — reset tokens are stored here, not on the User
- `EmailVerificationToken` — email verification codes (single-use)

**API serialization (`toPublicUser`):**
- `password` is never returned

---

### Note
**Table:** `Note`

**Purpose:** Rich-text user notes

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | Yes | `uuid()` | Primary key |
| `title` | String | Yes | "Untitled" | |
| `content` | String | Yes | "" | HTML content (TipTap output) |
| `userId` | UUID | Yes | | FK → User (cascade delete) |
| `notebookId` | UUID | No | null | FK → Notebook (set null on delete) |
| `isPinned` | Boolean | Yes | false | |
| `isFavorite` | Boolean | Yes | false | |
| `isArchived` | Boolean | Yes | false | |
| `wordCount` | Int | Yes | 0 | Estimated word count |
| `deletedAt` | Timestamp | No | null | Soft delete marker |
| `createdAt` | Timestamp | Yes | `now()` | |
| `updatedAt` | Timestamp | Yes | `@updatedAt` | |

**Relationships:**
- Many-to-many with `Tag` through the `NoteTag` join table

**Indexes:**
- `(userId, updatedAt)`
- `(userId, notebookId)`
- `(userId, isPinned, updatedAt)`
- `deletedAt`

**API serialization (`toNoteResponse`):**
- `NoteTag` rows → `tagIds: string[]`
- `contentPreview` added on list responses (first 50 chars of plain text)

---

### Notebook
**Table:** `Notebook`

**Purpose:** Note categorization folders

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | Yes | `uuid()` | Primary key |
| `name` | String | Yes | | Unique per user |
| `color` | String | Yes | "245 80% 66%" | |
| `userId` | UUID | Yes | | FK → User (cascade delete) |
| `deletedAt` | Timestamp | No | null | Soft delete marker |
| `createdAt` | Timestamp | Yes | `now()` | |
| `updatedAt` | Timestamp | Yes | `@updatedAt` | |

**Constraints:**
- `@@unique([userId, name])`

---

### Tag
**Table:** `Tag`

**Purpose:** Note tagging system

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | Yes | `uuid()` | Primary key |
| `name` | String | Yes | | Unique per user |
| `color` | String | Yes | "245 80% 66%" | |
| `userId` | UUID | Yes | | FK → User (cascade delete) |
| `deletedAt` | Timestamp | No | null | Soft delete marker |
| `createdAt` | Timestamp | Yes | `now()` | |
| `updatedAt` | Timestamp | Yes | `@updatedAt` | |

**Constraints:**
- `@@unique([userId, name])`
- `NoteTag.tagId` indexed

---

### PasswordResetToken
**Table:** `password_reset_tokens`

**Purpose:** One-time password reset tokens (6-digit codes)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `userId` | UUID | Yes | FK → User (cascade delete) |
| `tokenHash` | String | Yes | SHA-256 hashed (raw code never stored) |
| `expiresAt` | Timestamp | Yes | 15-minute expiry |
| `usedAt` | Timestamp | No | null until consumed |
| `createdAt` | Timestamp | Yes | |

**Indexes:** `@@index([userId, tokenHash])`, `@@index([userId, expiresAt])`

---

### EmailVerificationToken
**Table:** `email_verification_tokens`

**Purpose:** One-time email verification codes (6-digit)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `userId` | UUID | Yes | FK → User (cascade delete) |
| `tokenHash` | String | Yes | SHA-256 hashed (raw code never stored) |
| `expiresAt` | Timestamp | Yes | 15-minute expiry |
| `usedAt` | Timestamp | No | null until consumed |
| `createdAt` | Timestamp | Yes | |

**Indexes:** `@@index([userId, tokenHash])`, `@@index([userId, expiresAt])`

---

### UserSession
**Table:** `UserSession`

**Purpose:** Server-side authentication sessions (opaque tokens; no JWT)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Yes | Primary key |
| `userId` | UUID | Yes | FK → User (cascade delete) |
| `tokenHash` | String | Yes | SHA-256 hash of the raw 32-byte token (raw token never stored) |
| `deviceName` | String | No | From UA parsing |
| `ipAddress` | String | No | |
| `userAgent` | String | No | |
| `expiresAt` | Timestamp | Yes | 7-day expiry |
| `lastUsedAt` | Timestamp | No | Updated on each authenticated request |
| `revokedAt` | Timestamp | No | null until revoked (logout / password reset) |
| `createdAt` | Timestamp | Yes | |

**Indexes:** `@@index([userId])`, `@@index([tokenHash])`

---

### NoteTag
**Table:** `NoteTag`

**Purpose:** Join table between Notes and Tags

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `noteId` | UUID | Yes | FK → Note (cascade delete) |
| `tagId` | UUID | Yes | FK → Tag (cascade delete) |

**Primary key:** `@@id([noteId, tagId])`

---

## Relationships

```
User ─── (1:N) ─── Notes
User ─── (1:N) ─── Notebooks
User ─── (1:N) ─── Tags
User ─── (1:N) ─── PasswordResetTokens
User ─── (1:N) ─── EmailVerificationTokens
User ─── (1:N) ─── UserSessions
Notebook ─── (1:N) ─── Notes
Note ─── (N:N) ─── Tags [via NoteTag]
```

---

## Constraints

| Model | Constraint | Enforcement |
|-------|------------|-------------|
| User | id primary key, email unique | PostgreSQL |
| Notebook | (userId, name) unique | PostgreSQL compound unique |
| Tag | (userId, name) unique | PostgreSQL compound unique |
| Note | userId FK, notebookId FK | PostgreSQL foreign keys |
| NoteTag | (noteId, tagId) primary key | PostgreSQL |

---

## Soft Delete Pattern

All primary entities use `deletedAt`:
- `null` = active record
- Timestamp = soft-deleted record

**Query Pattern (Prisma):**
```javascript
// Find active notes
prisma.note.findMany({ where: { userId, deletedAt: null } })

// Find trashed notes
prisma.note.findMany({ where: { userId, deletedAt: { not: null } } })
```

Note: MongoDB's `tagIds` array was normalized into the `NoteTag` relation.
The API still exposes `tagIds` (mapped in `toNoteResponse`), so clients are unaffected.

---

## Ownership Rules

All data is owned by a single user:
- `Note.userId` - note owner
- `Notebook.userId` - notebook owner
- `Tag.userId` - tag owner

**Authorization:** All queries filter by `userId` to enforce ownership. Users can only access their own data.

---

## Lifecycle Behavior

### Creation
- `id`, `createdAt`, `updatedAt` handled by Prisma defaults
- `title` defaults to "Untitled" for notes

### Update
- `updatedAt` updated automatically via `@updatedAt`

### Soft Delete
- `deletedAt` set to current timestamp
- Does not remove from database

### Hard Delete
- Physical removal from database
- Used for permanent purge of notes

---

## Validation Rules

| Field | Validation |
|-------|------------|
| User.name | 2-50 chars (request validation) |
| User.email | Valid email format |
| User.password | Min 8 chars |
| Note.content | Sanitized HTML (server) + DOMPurify (client) |
| Route ids | UUID (`isUUID`) |
