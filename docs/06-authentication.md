# NoteFlow — Authentication

## Authentication Methods

NoteFlow uses **JWT-based cookie authentication** for session management.

---

## Registration (`POST /auth/register`)

**Flow:**
1. User provides `name`, `email`, `password`
2. Backend validates:
   - Name: 2-50 chars, letters and spaces only
   - Email: valid format
   - Password: min 8 chars with uppercase, lowercase, digit, special char
3. Password hashed with bcrypt (cost 12)
4. User document created in database
5. httpOnly JWT cookie (`noteflow_token`) is set

**Cookie Details:**
- Name: `noteflow_token`
- httpOnly: true
- secure: true (HTTPS only)
- sameSite: lax

---

## Login (`POST /auth/login`)

**Flow:**
1. User provides `email` and `password`
2. Backend finds user by email
3. Password verified with bcrypt compare
4. JWT token generated with user payload: `{ id, email, name }`
5. httpOnly JWT cookie set

**Token Expiration:** 7 days (configurable via `JWT_TTL`)

---

## Logout (`POST /auth/logout`)

**Flow:**
1. Server clears authentication cookie
2. Client-side state cleared via `authStore.logout()`

**Side Effect:** User returns to unauthenticated state

---

## Session Restoration (`GET /auth/verify`)

**Flow:**
1. App mounts and calls `authStore.restoreSession()`
2. `GET /auth/verify` sends httpOnly cookie
3. Server verifies JWT signature and extracts user ID
4. If valid: returns user data, client sets authenticated state
5. If invalid: returns 401, client clears user state

---

## Password Reset Flow

### 1. Request Reset (`POST /auth/forgot-password`)

**Flow:**
1. User provides `email`
2. Backend generates 32-byte random token
3. Token hashed with SHA-256
4. User document updated with `resetToken` and `resetTokenExpires` (1-hour expiry)
5. Email sent via Brevo with reset link
6. Generic response shown (prevents email enumeration)

### 2. Complete Reset (`POST /auth/reset-password`)

**Flow:**
1. User provides `token` (SHA-256 hash) and new `password`
2. Backend finds user with matching resetToken and valid expiry
3. Password reset with bcrypt hash
4. resetToken fields cleared

---

## Token Details

| Attribute | Value |
|-----------|-------|
| **Algorithm** | HS256 |
| **Payload** | `{ id: string, email: string, name: string }` |
| **Expiry** | 7 days |
| **Storage** | httpOnly cookie (`noteflow_token`) |
| **SameSite** | lax |
| **Secure** | true (HTTPS only) |

---

## Password Handling

| Aspect | Implementation |
|--------|----------------|
| **Hashing** | bcrypt with cost 12 |
| **Transmission** | HTTPS only |
| **Storage** | Hash only (never plaintext) |
| **Reset** | SHA-256 hashed token with 1-hour expiry |

---

## Authentication Middleware

**File:** `backend/src/middleware/auth.js`

**Functionality:**
1. Extracts JWT from `noteflow_token` cookie
2. Verifies signature with `JWT_ACCESS_SECRET`
3. If valid: attaches `{ id, email, name }` to `req.user`
4. If invalid: returns 401 `unauthorized` error

**Usage:**
```javascript
router.use('/notes', authRequired, notesRouter);
```

---

## Protected Routes

| Route | Auth Required |
|-------|---------------|
| `/api/v1/me` | Yes |
| `/api/v1/notes/*` | Yes |
| `/api/v1/notebooks/*` | Yes |
| `/api/v1/tags/*` | Yes |
| `/api/v1/auth/verify` | Yes |

**Public Routes:**
- `/api/v1/auth/register`
- `/api/v1/auth/login`
- `/api/v1/auth/logout`
- `/api/v1/auth/forgot-password`
- `/api/v1/auth/reset-password`

---

## Cookie Behavior

| Browser Action | Behavior |
|----------------|----------|
| Login | Cookie set with 7-day expiry |
| Session active | Cookie sent on each request |
| Logout | Cookie cleared |
| Token expired | 401 returned, client redirects to login |
| Cross-origin | blocked by sameSite=lax |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 10 requests per minute |
| All other routes | 100 requests per minute |
