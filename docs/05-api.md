# NoteFlow — API Documentation

All endpoints are prefixed with `/api/v1`.

---

## Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* ... */ },
  "code": null,
  "message": "Success message"
}
```

The `message` field contains a human-readable success message (e.g., "registered", "logged in", "Delete account").

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "code": "error_code",
  "message": "Human-readable error message"
}
```

---

## Auth Routes (`/auth`)

### POST `/auth/register`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Create new account |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation:** `registerV` (name: 2-50 chars, email: valid, password: strong)

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* user object without password */ } },
  "code": "registered",
  "status": 201
}
```

**Side Effect:** Sets httpOnly JWT cookie (`noteflow_token`)

---

### POST `/auth/login`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Sign in existing user |

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation:** `loginV`

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* user object */ } }
}
```

**Side Effect:** Sets httpOnly JWT cookie

---

### POST `/auth/logout`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Clear session |

**Response:**
```json
{
  "success": true,
  "data": null,
  "code": "logged out"
}
```

**Side Effect:** Clears authentication cookie

---

### POST `/auth/forgot-password`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Initiate password reset |

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:** `forgotV`

**Response:**
```json
{
  "success": true,
  "message": "If that email exists, a reset link has been sent"
}
```

**Side Effect:** Generates and stores resetToken on User document

---

### POST `/auth/reset-password`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Complete password reset |

**Request Body:**
```json
{
  "token": "hashed-reset-token",
  "password": "NewSecurePass123!"
}
```

**Validation:** `resetV`

**Response:**
```json
{
  "success": true,
  "message": "Password updated"
}
```

**Side Effect:** Clears resetToken fields on User

---

### GET `/auth/verify`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Restore session |

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* user object */ } }
}
```

---

### Authentication Cookies

All auth endpoints (`/register`, `/login`, `/verify`) set an httpOnly JWT cookie named `noteflow_token`. The cookie behavior varies by environment:

| Attribute | Development (`NODE_ENV=development`) | Production (`NODE_ENV=production`) |
|-----------|--------------------------------------|-------------------------------------|
| `httpOnly` | `true` | `true` |
| `secure` | `false` (insecure) | `true` (HTTPS only) |
| `sameSite` | `"lax"` | `"none"` |
| `maxAge` | 7 days | 7 days |
| `path` | `/` | `/` |

**Important:** In development, cookies are not secure and can be transmitted over HTTP. Production must use HTTPS with `secure: true`.

---

## User Routes (`/me`)

### GET `/me`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Get current user profile |

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* user object */ } }
}
```

---

### PATCH `/me`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Update user name |

**Request Body:**
```json
{
  "name": "Jane Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* updated user object */ } }
}
```

---

### POST `/me/password`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Change password |

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST `/me/avatar`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Upload avatar image |

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* updated user object */ } }
}
```

---

### DELETE `/me/avatar`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Remove avatar image |

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* updated user object */ } }
}
```

---

### DELETE `/me`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Soft-delete account |

**Response:**
```json
{
  "success": true
}
```

---

## Notes Routes (`/notes`)

### GET `/notes`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | List notes with filtering |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Text search |
| `dateFilter` | string | today, yesterday, last_7_days, last_30_days, last_90_days, last_year, custom |
| `from`, `to` | string | Custom date range |
| `page`, `limit` | number | Pagination (default: page=1, limit=20) |
| `sort` | string | title |
| `notebookId` | UUID | Filter by notebook |
| `tagId` | UUID | Filter by tag |
| `isArchived` | boolean | Filter archived |
| `isFavorite` | boolean | Filter favorites |
| `isPinned` | boolean | Filter pinned |
| `trashed` | boolean | Include trashed notes |
| `includeContent` | boolean | Include full content |

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [ /* note objects */ ],
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### POST `/notes`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Create note |

**Request Body:**
```json
{
  "title": "My Note",
  "content": "<p>HTML content...</p>",
  "notebookId": "notebook_id",
  "tagIds": ["tag_id_1", "tag_id_2"],
  "cover": { "color": "245 80% 66%", "emoji": "📝" },
  "isFavorite": true
}
```

**Validation:** `notes.create`

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* note object */ } }
}
```

---

### GET `/notes/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Get single note |

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* note object */ } }
}
```

---

### PATCH `/notes/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Update note |

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "notebookId": "new_notebook_id",
  "tagIds": ["new_tag_id"],
  "isPinned": true,
  "isArchived": false,
  "isFavorite": false
}
```

**Validation:** `notes.update`

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* updated note object */ } }
}
```

---

### DELETE `/notes/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Soft-delete note |

**Response:**
```json
{
  "success": true
}
```

---

### POST `/notes/:id/pin`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Toggle pin status |

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* updated note object */ } }
}
```

---

### POST `/notes/:id/favorite`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Toggle favorite status |

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* updated note object */ } }
}
```

---

### POST `/notes/:id/archive`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Toggle archive status |

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* updated note object */ } }
}
```

---

### POST `/notes/:id/restore`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Restore from trash |

**Response:**
```json
{
  "success": true,
  "data": { "note": { /* updated note object */ } }
}
```

---

### POST `/notes/:id/purge`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Permanent deletion |

**Response:**
```json
{
  "success": true
}
```

---

### GET `/notes/trash`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | List trashed notes |

**Response:**
```json
{
  "success": true,
  "data": { "notes": [ /* trashed note objects */ ] }
}
```

---

### GET `/notes/counts`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Get note statistics |

**Response:**
```json
{
  "success": true,
  "data": {
    "all": 150,
    "favorites": 25,
    "archive": 10,
    "trash": 5,
    "notebooks": 8,
    "tags": 12
  }
}
```

---

## Notebooks Routes (`/notebooks`)

### GET `/notebooks`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | List notebooks |

**Response:**
```json
{
  "success": true,
  "data": { "notebooks": [ /* notebook objects */ ] }
}
```

---

### POST `/notebooks`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Create notebook |

**Request Body:**
```json
{
  "name": "Personal Notes",
  "color": "245 80% 66%"
}
```

**Validation:** `notebooks.create`

**Response:**
```json
{
  "success": true,
  "data": { "notebook": { /* notebook object */ } }
}
```

---

### PATCH `/notebooks/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Update notebook |

**Response:**
```json
{
  "success": true,
  "data": { "notebook": { /* updated notebook object */ } }
}
```

---

### DELETE `/notebooks/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Soft-delete notebook |

**Response:**
```json
{
  "success": true
}
```

---

## Tags Routes (`/tags`)

### GET `/tags`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | List tags |

**Response:**
```json
{
  "success": true,
  "data": { "tags": [ /* tag objects */ ] }
}
```

---

### POST `/tags`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Create tag |

**Request Body:**
```json
{
  "name": "Work",
  "color": "200 80% 60%"
}
```

**Validation:** `tags.create`

**Response:**
```json
{
  "success": true,
  "data": { "tag": { /* tag object */ } }
}
```

---

### PATCH `/tags/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Update tag |

**Response:**
```json
{
  "success": true,
  "data": { "tag": { /* updated tag object */ } }
}
```

---

### DELETE `/tags/:id`
| Attribute | Value |
|-----------|-------|
| **Auth** | Required |
| **Purpose** | Soft-delete tag |

**Response:**
```json
{
  "success": true
}
```

---

## Error Responses

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Invalid/expired JWT |
| `validation_error` | 400 | Invalid request data |
| `forbidden` | 403 | Unauthorized resource access |
| `not_found` | 404 | Resource not found |
| `database_error` | 500 | Database operation failed |
