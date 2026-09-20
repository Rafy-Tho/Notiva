# API Routes

## Base Path
All routes are prefixed with `/api/v1`.

---

## Auth Routes

### POST `/auth/register`
**Authentication:** Public  
**Rate Limit:** 10/min  
**Purpose:** Create new account  

**Request Body:**
- `name` (string, 2-50 chars, letters/spaces only)
- `email` (string, valid email format)
- `password` (string, min 8 chars, uppercase, lowercase, digit, special char)

**Validation:** `registerV`  
**Handler:** `auth.controller.register`  
**Service:** `auth.service.register`  
**Database:** Creates User document  
**Response:** `{ success: true, data: { user }, code: "registered", status: 201 }`

---

### POST `/auth/login`
**Authentication:** Public  
**Rate Limit:** 10/min  
**Purpose:** Sign in existing user  

**Request Body:**
- `email` (string, valid email)
- `password` (string)

**Validation:** `loginV`  
**Handler:** `auth.controller.login`  
**Service:** `auth.service.login`  
**Database:** Reads User document  
**Response:** `{ success: true, data: { user } }`  
**Side Effect:** Sets httpOnly JWT cookie

---

### POST `/auth/logout`
**Authentication:** Public  
**Rate Limit:** 10/min  
**Purpose:** Clear session cookie  

**Handler:** `auth.controller.logout`  
**Database:** None  
**Response:** `{ success: true, data: null, code: "logged out" }`

---

### POST `/auth/forgot-password`
**Authentication:** Public  
**Rate Limit:** 10/min  
**Purpose:** Initiate password reset  

**Request Body:**
- `email` (string, valid email)

**Validation:** `forgotV`  
**Handler:** `auth.controller.forgotPassword`  
**Service:** `auth.service.createResetToken` + `email.service.sendResetEmail`  
**Database:** Updates User with resetToken + resetTokenExpires  
**Response:** `{ success: true, message: "If that email exists, a reset link has been sent" }`

---

### POST `/auth/reset-password`
**Authentication:** Public  
**Rate Limit:** 10/min  
**Purpose:** Complete password reset  

**Request Body:**
- `token` (string, SHA-256 hash of reset token)
- `password` (string, same requirements as register)

**Validation:** `resetV`  
**Handler:** `auth.controller.resetPassword`  
**Service:** `auth.service.consumeResetToken`  
**Database:** Updates User password, clears resetToken fields  
**Response:** `{ success: true, message: "Password updated" }`

---

### GET `/auth/verify`
**Authentication:** Required  
**Purpose:** Restore session  

**Handler:** `auth.controller.verify`  
**Service:** `me.service.get`  
**Database:** Reads User document  
**Response:** `{ success: true, data: { user } }`

---

## User Routes

### GET `/me`
**Authentication:** Required  
**Purpose:** Get current user profile  

**Handler:** `me.controller.get`  
**Service:** `me.service.get`  
**Database:** Reads User document  
**Response:** `{ success: true, data: { user } }`

---

### PATCH `/me`
**Authentication:** Required  
**Purpose:** Update user name  

**Request Body:**
- `name` (string)

**Validation:** `meV`  
**Handler:** `me.controller.update`  
**Service:** `me.service.update`  
**Database:** Updates User document  
**Response:** `{ success: true, data: { user } }`

---

### POST `/me/password`
**Authentication:** Required  
**Purpose:** Change password  

**Request Body:**
- `currentPassword` (string)
- `newPassword` (string, same validation)

**Validation:** `meV`  
**Handler:** `me.controller.changePassword`  
**Service:** `me.service.changePassword`  
**Database:** Updates User password  
**Response:** `{ success: true }`

---

### POST `/me/avatar`
**Authentication:** Required  
**Purpose:** Upload avatar image  

**Request Body:** `multipart/form-data` with `file` field  
**Handler:** `me.controller.uploadAvatar`  
**Service:** `upload.service.uploadToCloudinary`  
**Database:** Updates User avatar field  
**Response:** `{ success: true, data: { user } }`

---

### DELETE `/me`
**Authentication:** Required  
**Purpose:** Soft-delete account  

**Handler:** `me.controller.deleteAccount`  
**Service:** `me.service.deleteAccount`  
**Database:** Sets User.deletedAt  
**Response:** `{ success: true }`

---

## Notes Routes

### GET `/notes`
**Authentication:** Required  
**Purpose:** List notes  

**Query Parameters:**
- `search` (string) - Text search
- `dateFilter` (string) - today, yesterday, last_7_days, last_30_days, last_90_days, last_year, custom
- `from`, `to` (string) - Custom date range
- `page`, `limit` (number) - Pagination
- `sort` (string) - title
- `notebookId`, `tagId` (ObjectId) - Filter by notebook/tag
- `isArchived`, `isFavorite`, `isPinned` (boolean) - Filter flags
- `trashed` (boolean) - Include trashed notes
- `includeContent` (boolean) - Include full content

**Handler:** `notes.controller.list`  
**Service:** `notes.service.listNotes`  
**Database:** Reads Note documents  
**Response:** `{ success: true, data: { notes, page, limit, total, totalPages, hasMore } }`

---

### POST `/notes`
**Authentication:** Required  
**Purpose:** Create note  

**Request Body:**
- `title` (string)
- `content` (string, HTML)
- `notebookId` (ObjectId)
- `tagIds` (array of ObjectId)
- `cover` (object with color, emoji)
- `isFavorite` (boolean)

**Validation:** `notes.create`  
**Handler:** `notes.controller.create`  
**Service:** `notes.service.createNote`  
**Database:** Creates Note document  
**Response:** `{ success: true, data: { note } }`

---

### GET `/notes/:id`
**Authentication:** Required  
**Purpose:** Get single note  

**Handler:** `notes.controller.get`  
**Service:** `notes.service.getNote`  
**Database:** Reads Note document  
**Response:** `{ success: true, data: { note } }`

---

### PATCH `/notes/:id`
**Authentication:** Required  
**Purpose:** Update note  

**Request Body:**
- `title`, `content`, `notebookId`, `tagIds`, `cover`, `isPinned`, `isArchived`, `isFavorite`

**Validation:** `notes.update`  
**Handler:** `notes.controller.update`  
**Service:** `notes.service.updateNote`  
**Database:** Updates Note document  
**Response:** `{ success: true, data: { note } }`

---

### DELETE `/notes/:id`
**Authentication:** Required  
**Purpose:** Move note to trash  

**Handler:** `notes.controller.remove`  
**Service:** `notes.service.softDelete`  
**Database:** Sets Note.deletedAt  
**Response:** `{ success: true }`

---

### POST `/notes/:id/pin`
**Authentication:** Required  
**Purpose:** Toggle pin status  

**Handler:** `notes.controller.togglePin`  
**Service:** `notes.service.toggleField`  
**Database:** Updates Note.isPinned  
**Response:** `{ success: true, data: { note } }`

---

### POST `/notes/:id/favorite`
**Authentication:** Required  
**Purpose:** Toggle favorite status  

**Handler:** `notes.controller.toggleFavorite`  
**Service:** `notes.service.toggleField`  
**Database:** Updates Note.isFavorite  
**Response:** `{ success: true, data: { note } }`

---

### POST `/notes/:id/archive`
**Authentication:** Required  
**Purpose:** Toggle archive status  

**Handler:** `notes.controller.toggleArchive`  
**Service:** `notes.service.toggleField`  
**Database:** Updates Note.isArchived  
**Response:** `{ success: true, data: { note } }`

---

### POST `/notes/:id/restore`
**Authentication:** Required  
**Purpose:** Restore from trash  

**Handler:** `notes.controller.restore`  
**Service:** `notes.service.restore`  
**Database:** Sets Note.deletedAt = null  
**Response:** `{ success: true, data: { note } }`

---

### POST `/notes/:id/purge`
**Authentication:** Required  
**Purpose:** Permanent deletion  

**Handler:** `notes.controller.purge`  
**Service:** `notes.service.permanentDelete`  
**Database:** Deletes Note document  
**Response:** `{ success: true }`

---

### GET `/notes/trash`
**Authentication:** Required  
**Purpose:** List trashed notes  

**Handler:** `notes.controller.getTrashNotes`  
**Service:** `notes.service.trashNotes`  
**Database:** Reads Note documents where deletedAt != null  
**Response:** `{ success: true, data: { notes } }`

---

### GET `/notes/counts`
**Authentication:** Required  
**Purpose:** Get note statistics  

**Handler:** `notes.controller.getCounts`  
**Service:** `notes.service.getNoteCounts`  
**Database:** Aggregates Note counts  
**Response:** `{ success: true, data: { all, favorites, archive, trash, notebooks, tags } }`

---

## Notebooks Routes

### GET `/notebooks`
**Authentication:** Required  
**Purpose:** List notebooks  

**Handler:** `notebooks.controller.list`  
**Database:** Reads Notebook documents  
**Response:** `{ success: true, data: { notebooks } }`

---

### POST `/notebooks`
**Authentication:** Required  
**Purpose:** Create notebook  

**Request Body:**
- `name` (string)
- `color` (string)

**Validation:** `notebooks.create`  
**Handler:** `notebooks.controller.create`  
**Database:** Creates Notebook document  
**Response:** `{ success: true, data: { notebook } }`

---

### PATCH `/notebooks/:id`
**Authentication:** Required  
**Purpose:** Update notebook  

**Handler:** `notebooks.controller.update`  
**Database:** Updates Notebook document  
**Response:** `{ success: true, data: { notebook } }`

---

### DELETE `/notebooks/:id`
**Authentication:** Required  
**Purpose:** Soft-delete notebook  

**Handler:** `notebooks.controller.remove`  
**Database:** Sets Notebook.deletedAt  
**Response:** `{ success: true }`

---

## Tags Routes

### GET `/tags`
**Authentication:** Required  
**Purpose:** List tags  

**Handler:** `tags.controller.list`  
**Database:** Reads Tag documents  
**Response:** `{ success: true, data: { tags } }`

---

### POST `/tags`
**Authentication:** Required  
**Purpose:** Create tag  

**Request Body:**
- `name` (string)
- `color` (string)

**Validation:** `tags.create`  
**Handler:** `tags.controller.create`  
**Database:** Creates Tag document  
**Response:** `{ success: true, data: { tag } }`

---

### PATCH `/tags/:id`
**Authentication:** Required  
**Purpose:** Update tag  

**Handler:** `tags.controller.update`  
**Database:** Updates Tag document  
**Response:** `{ success: true, data: { tag } }`

---

### DELETE `/tags/:id`
**Authentication:** Required  
**Purpose:** Soft-delete tag  

**Handler:** `tags.controller.remove`  
**Database:** Sets Tag.deletedAt  
**Response:** `{ success: true }`

---

## Response Format

All responses follow this structure:
```json
{
  "success": true,
  "data": { /* ... */ },
  "code": null,
  "message": "..."
}
```

Error responses set `success: false` and include `code` and `message`.

---

## Unknowns

| Route | Status |
|-------|--------|
| Health check (`GET /`) | CONFIRMED - Returns HTML healthy message |
