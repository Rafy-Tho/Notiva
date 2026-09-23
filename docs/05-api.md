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
| **Purpose** | Create account (unverified) and send verification code |

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
  "code": "Verification code sent",
  "status": 201
}
```

**Side Effect:**
- Creates the user with `emailVerifiedAt = null` (unverified).
- If the email already exists but is unverified, the existing account is reused (password unchanged).
- Sends a 6-digit email verification code (SHA-256 hashed, 15-minute expiry, single-use, per-user).
- Does **not** set an authentication cookie — the user stays logged out until verification.

**Errors:** `400` validation, `409` `USER_ALREADY_EXISTS` when the email is already verified.

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

**Side Effect:** Sets httpOnly `noteflow_session` cookie (7-day expiry). Failed attempts are tracked per email (5/hour lockout); the counter resets on success.

**Errors:** `400` validation, `401` invalid credentials / deleted account, `401` `Email not verified` for unverified users, `429` locked after too many attempts.

---

### POST `/auth/resend-verification`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 5/hour (business-level, per email) |
| **Purpose** | Resend the 6-digit email verification code |

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:** `resendVerificationV`

**Response:**
```json
{
  "success": true,
  "data": null,
  "code": "Verification code sent"
}
```

**Side Effect:** Deletes prior verification tokens for the user and emits a new one (SHA-256 hashed, 15-minute expiry, single-use).

**Errors:** `401` unknown user, `400` already verified, `429` too many requests.

---

### POST `/auth/verify-email`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Confirm email with the 6-digit code and log the user in |

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Validation:** `verifyEmailV`

**Response:**
```json
{
  "success": true,
  "data": { "user": { /* user object with emailVerifiedAt set */ } },
  "code": "Email verified"
}
```

**Side Effect:** Marks the user's email verified, consumes the code (`usedAt`), and creates a normal server session — the httpOnly `noteflow_session` cookie is set, so the user is logged in without re-entering their password.

**Errors:** `400` validation / already verified, `401` invalid or expired code.

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

**Side Effect:** Clears the authentication cookie. When the request carries a valid session, that user's sessions are revoked server-side.

---

### POST `/auth/reset-password-code`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 5/hour (business-level, per email) |
| **Purpose** | Send 6-digit password reset code |

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:** `resetPasswordV`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "If the account exists, a reset code has been sent"
}
```

**Side Effect:** For an existing, verified email, creates a PasswordResetToken row (SHA-256 hashed, 15-minute expiry); prior tokens for the user are deleted. For unknown or unverified emails, no token is created and no email is sent — the response is identical to prevent email enumeration.

---

### POST `/auth/confirm-password-reset`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Complete password reset with code |

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456",
  "password": "NewSecurePass123!"
}
```

**Validation:** `confirmPasswordResetV`

**Response:**
```json
{
  "success": true,
  "data": { "user": { "id": "...", "email": "john@example.com" } }
}
```

**Side Effect:** Updates password (bcrypt cost 12), marks the PasswordResetToken as used (`usedAt`), and revokes all of the user's existing sessions.

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

### GET `/auth/google`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Start Google OAuth sign-in |

**Flow:**
1. Backend generates a random `state` value and stores it in an httpOnly `oauth_state` cookie (10-minute expiry)
2. Redirects (302) to Google's OAuth consent screen (`redirect_uri` = `GOOGLE_CALLBACK_URL`, scope `openid email profile`)

**Errors:** no JSON error envelope; if Google OAuth is not configured the user is redirected to `FRONTEND_ORIGIN/login?oauth_error=google_not_configured`.

---

### GET `/auth/google/callback`
| Attribute | Value |
|-----------|-------|
| **Auth** | Public |
| **Rate Limit** | 10/min |
| **Purpose** | Complete Google OAuth sign-in |

**Query Parameters:** `code`, `state` (plus `error` when the user cancels at Google)

**Flow:**
1. Validates `state` against the `oauth_state` cookie (cleared after use); invalid state is rejected (no account change)
2. Handles a Google `error` response (e.g., `access_denied`) as a cancelled login
3. Exchanges `code` for tokens at Google's token endpoint (client secret used server-side)
4. Verifies the ID token signature against Google's public JWKS and validates `iss`, `aud` (must equal `GOOGLE_CLIENT_ID`), `exp`, and `email_verified`
5. Resolves the user by Google `sub` (never email):
   - Account found by `(provider='google', provider_user_id)` → logs in that user
   - Otherwise, finds an existing user by the verified Google email → links the account (marks email verified if unverified, never changes the password)
   - Otherwise, creates a new verified user (name/avatar from Google, random unusable password) and links the Google account
6. Race-safe: the `UNIQUE(provider, provider_user_id)` constraint prevents one Google account from being linked to multiple users; concurrent callbacks recover by re-fetching the winning account
7. Rejects soft-deleted (`deletedAt`) accounts
8. Creates the normal server session, sets the `noteflow_session` cookie, and redirects (302) to the frontend root

**Failure behavior:** never returns a JSON error envelope to the browser; failures redirect to `FRONTEND_ORIGIN/login?oauth_error=<key>` where the key is `cancelled`, `invalid_state`, `invalid_callback`, or `google_failed`.

---

### Authentication Cookies

The app uses opaque **server-session authentication** (no JWT). `POST /login` and `POST /auth/verify-email` set an httpOnly cookie named `noteflow_session`; the raw token is a 32-byte random hex value and only its SHA-256 hash is stored in the `UserSession` table. `POST /register` does **not** set a cookie. The cookie behavior varies by environment:

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
