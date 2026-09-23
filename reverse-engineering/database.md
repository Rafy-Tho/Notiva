# Database Schema

## User

**Collection:** `users`  
**Purpose:** Application accounts

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | |
| `email` | String | Yes | | unique, lowercase, indexed |
| `password` | String | Yes | | bcrypt hash (cost 12) |
| `avatar` | String | No | | Cloudinary URL |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | timestamps |
| `updatedAt` | Date | Yes | auto | timestamps |

**Indexes:**
- `email` (unique)

**JSON Transform:**
- `password` excluded
- `_id` renamed to `id`
- `__v` excluded

---

## Note

**Collection:** `notes`  
**Purpose:** User notes

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `title` | String | No | "Untitled" | |
| `content` | String | No | "" | HTML content |
| `userId` | ObjectId | Yes | | refs User, indexed |
| `notebookId` | ObjectId | No | null | refs Notebook, indexed |
| `tagIds` | Array | No | [] | refs Tag[] (indexed array) |
| `isPinned` | Boolean | No | false | |
| `isFavorite` | Boolean | No | false | |
| `isArchived` | Boolean | No | false | |
| `wordCount` | Number | No | 0 | |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | timestamps |
| `updatedAt` | Date | Yes | auto | timestamps |

**Indexes:**
- `userId`
- `notebookId`
- `tagIds` (array)
- `title`, `content` (text search)

**Virtuals:**
- `contentPreview` (first 50 chars of plain text)

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

## Notebook

**Collection:** `notebooks`  
**Purpose:** User notebooks

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | unique per user |
| `color` | String | No | "245 80% 66%" | |
| `userId` | ObjectId | Yes | | refs User, indexed |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | timestamps |
| `updatedAt` | Date | Yes | auto | timestamps |

**Indexes:**
- `userId`, `name` (unique compound)

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

## Tag

**Collection:** `tags`  
**Purpose:** User tags

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | unique per user |
| `color` | String | No | "200 80% 60%" | |
| `userId` | ObjectId | Yes | | refs User, indexed |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | timestamps |
| `updatedAt` | Date | Yes | auto | timestamps |

**Indexes:**
- `userId`, `name` (unique compound)

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

## Relationships

```
User (1) ─── has ───> (N) Note
User (1) ─── has ───> (N) Notebook
User (1) ─── has ───> (N) Tag
Note (N) ─── belongs to ───> (1) Notebook
Note (N) ─── has ───> (N) Tag
```

## Constraints

| Model | Constraint |
|-------|------------|
| User | email unique |
| Notebook | (userId, name) unique |
| Tag | (userId, name) unique |
| Note | userId required |

## Soft Delete Pattern

All models use `deletedAt` field:
- `null` = active
- Date value = soft-deleted
- Queries filter: `deletedAt: null` for active items

---

## Unknowns

| Entity | Status |
|--------|--------|
| Seed data | UNKNOWN |
