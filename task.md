Implement complete **Google Login / OAuth** using the existing authentication and **server-side session** system.

### Database

Use the existing:

```sql
CREATE TABLE auth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
```

For Google:

```text
provider = "google"
provider_user_id = Google `sub`
```

Never use email as `provider_user_id`.

### Flow

Implement:

```text
GET /auth/google
GET /auth/google/callback
```

Use Google OAuth/OpenID Connect with:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

After successful Google authentication:

1. Find `auth_accounts` by `google + provider_user_id`.
2. If found → login existing user.
3. If not found → find existing user by the **verified Google email**.
4. If email exists → link Google account to that user. Do not create a duplicate or remove their password.
5. If email does not exist → create a new user with existing defaults and create the Google account.
6. Google-authenticated email should be treated as verified.
7. Create the normal server-side session and HTTP-only cookie.
8. Redirect to the frontend.

### Security

- Use OAuth `state` protection.
- Validate the Google identity/token on the backend.
- Never trust frontend-provided Google IDs/emails.
- Never expose client secret or Google tokens to frontend/localStorage.
- Handle cancelled login, invalid state, invalid callback, inactive users, duplicate accounts, and database race conditions.
- Prevent one Google account from being linked to multiple users.

### Compatibility

Do **not** replace existing authentication.

Preserve:

- Email/password login
- Registration
- Email verification
- Password reset
- Sessions
- Logout
- Protected routes
- Existing user roles/status

Add the Google button to the existing login page.

Inspect the current auth/session code first and reuse existing utilities. Do not rewrite unrelated code or introduce JWT.
