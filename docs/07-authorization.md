# NoteFlow — Authorization

## Overview

NoteFlow uses **resource-based authorization** where all data is owned by individual users. There are no global roles or permissions—users can only access their own resources.

---

## User Ownership

All data is scoped to the user:
- Notes belong to a single user (`Note.userId`)
- Notebooks belong to a single user (`Notebook.userId`)
- Tags belong to a single user (`Tag.userId`)

**Key Principle:** A user can only access resources where `userId` matches their authenticated user ID.

---

## Authorization Middleware

**File:** `backend/src/middleware/auth.js`

**Functionality:**
```javascript
// Extracts user from JWT token
// Attaches to req.user: { id, email, name }
// Returns 401 if token invalid
```

All protected routes use `authRequired` middleware to ensure the request is authenticated.

---

## Ownership Enforcement

All service operations filter by `userId`:

**Example - Notes Service:**
```javascript
const notes = await Note.find({
  userId: req.user.id,
  deletedAt: null  // Exclude trashed unless requested
});
```

**Examples:**
| Service | Ownership Filter |
|---------|------------------|
| `notes.service.js` | `userId: req.user.id` |
| `notebooks.service.js` | `userId: req.user.id` |
| `tags.service.js` | `userId: req.user.id` |
| `me.service.js` | Direct user access (owner is auth user) |

---

## Protected Resources

| Resource | Access Rule |
|----------|-------------|
| Notes | Only owner can read/update/delete |
| Notebooks | Only owner can read/update/delete |
| Tags | Only owner can read/update/delete |
| User Profile | Only self can modify |

---

## Authorization Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `unauthorized` | 401 | Not authenticated |
| `forbidden` | 403 | Authenticated but not owner |

**Note:** Most endpoints return `unauthorized` for all auth failures to prevent user enumeration.

---

## Access Control Logic

### Request Processing Flow
```
1. Request arrives at protected route
2. authRequired middleware extracts user from JWT
3. Controller calls service with req.user.id
4. Service filters all queries by userId
5. User only sees/edits their own data
```

### Cross-User Access Prevention
| Attack Vector | Protection |
|---------------|------------|
| Direct ID access | All queries include `userId` filter |
| Batch operations | All services filter by `userId` |
| Deletion | Soft-delete checks ownership |

---

## Session vs Authorization

| Aspect | Authentication | Authorization |
|--------|----------------|---------------|
| **Purpose** | Verify identity | Verify access rights |
| **Mechanism** | JWT cookie | User ID ownership |
| **Check** | Token signature | Resource ownership |
| **Error** | `unauthorized` (401) | `forbidden` (403) |

---

## Security Properties

| Property | Implementation |
|----------|----------------|
| Data isolation | User-based filtering on all queries |
| Token binding | JWT payload includes user ID |
| Session scope | One user per session |
| No role escalation | No role/permission system exists |
