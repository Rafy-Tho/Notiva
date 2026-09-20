# NoteFlow — Data Model

## Entities

### User
**Collection:** `users`

**Purpose:** Application user accounts

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | User display name |
| `email` | String | Yes | | Unique, lowercase, indexed |
| `password` | String | Yes | | bcrypt hash (cost 12) |
| `avatar` | String | No | | Cloudinary URL |
| `resetToken` | String | No | | SHA-256 hashed |
| `resetTokenExpires` | Date | No | | 1-hour expiry |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | Timestamp |
| `updatedAt` | Date | Yes | auto | Timestamp |

**Indexes:**
- `email` (unique)

**JSON Transform:**
- `password`, `resetToken`, `resetTokenExpires` excluded from responses
- `_id` renamed to `id`
- `__v` excluded

---

### Note
**Collection:** `notes`

**Purpose:** Rich-text user notes

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `title` | String | No | "Untitled" | |
| `content` | String | No | "" | HTML content (TipTap output) |
| `userId` | ObjectId | Yes | | References User, indexed |
| `notebookId` | ObjectId | No | null | References Notebook, indexed |
| `tagIds` | Array | No | [] | References Tag[] (indexed array) |
| `isPinned` | Boolean | No | false | Pin status |
| `isFavorite` | Boolean | No | false | Favorite status |
| `isArchived` | Boolean | No | false | Archive status |
| `cover` | Object | No | {} | `{color: string, emoji: string}` |
| `wordCount` | Number | No | 0 | Estimated word count |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | Timestamp |
| `updatedAt` | Date | Yes | auto | Timestamp |

**Indexes:**
- `userId`
- `notebookId`
- `tagIds` (array index)
- `title`, `content` (text search)

**Virtuals:**
- `contentPreview` - First 50 chars of plain text content

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

### Notebook
**Collection:** `notebooks`

**Purpose:** Note categorization folders

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | Unique per user |
| `color` | String | No | "245 80% 66%" | Tailwind color |
| `userId` | ObjectId | Yes | | References User, indexed |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | Timestamp |
| `updatedAt` | Date | Yes | auto | Timestamp |

**Indexes:**
- `userId`, `name` (unique compound)

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

### Tag
**Collection:** `tags`

**Purpose:** Note tagging system

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Yes | auto | Primary key |
| `name` | String | Yes | | Unique per user |
| `color` | String | No | "200 80% 60%" | Tailwind color |
| `userId` | ObjectId | Yes | | References User, indexed |
| `deletedAt` | Date | No | null | Soft delete marker |
| `createdAt` | Date | Yes | auto | Timestamp |
| `updatedAt` | Date | Yes | auto | Timestamp |

**Indexes:**
- `userId`, `name` (unique compound)

**JSON Transform:**
- `_id` renamed to `id`
- `__v` excluded

---

## Relationships

```
User ─── (1:N) ─── Notes
User ─── (1:N) ─── Notebooks
User ─── (1:N) ─── Tags
Note ─── (N:1) ─── Notebook
Note ─── (N:N) ─── Tags [via tagIds array]
```

---

## Constraints

| Model | Constraint | Enforcement |
|-------|------------|-------------|
| User | email unique | MongoDB unique index |
| Notebook | (userId, name) unique | MongoDB unique compound index |
| Tag | (userId, name) unique | MongoDB unique compound index |
| Note | userId required | Mongoose schema validation |

---

## Soft Delete Pattern

All entities use `deletedAt` field:
- `null` = active record
- Date value = soft-deleted record

**Query Pattern:**
```javascript
// Find active notes
Note.find({ userId, deletedAt: null })

// Find all notes including trash
Note.find({ userId })
```

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
- All timestamps auto-populated by Mongoose
- `title` defaults to "Untitled" for notes

### Update
- `updatedAt` auto-populated on modification

### Soft Delete
- `deletedAt` set to current timestamp
- Does not remove from database

### Hard Delete
- Physical removal from database
- Used for permanent purge of notes
- Not implemented for notebooks/tags

---

## Validation Rules

| Field | Validation |
|-------|------------|
| User.name | 2-50 chars, letters and spaces only |
| User.email | Valid email format |
| User.password | Min 8 chars, uppercase, lowercase, digit, special char |
| Note.content | Sanitized HTML (server) + DOMPurified (client) |
