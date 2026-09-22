Refactor the existing authentication system from **JWT authentication to server-side session authentication**.

### Requirements

- Remove JWT authentication.
- Use an HTTP-only cookie containing a random session token.
- Store only the **SHA-256 hash** of the session token in the database.
- Use this table:

```sql
user_sessions (
  id uuid primary key,
  user_id uuid not null references users(id),
  token_hash text not null unique,
  device_name varchar(255),
  ip_address inet,
  user_agent text,
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
)
```

### Session behavior

- Generate a cryptographically secure random token.
- Store its hash in `user_sessions`.
- Send the raw token using a secure HTTP-only cookie.
- Validate the session on authenticated requests.
- Update `last_used_at`.
- Reject expired or revoked sessions.
- Support logout by revoking the current session.
- Do not store the raw token in the database.
- Preserve existing API behavior, permissions, roles, and frontend functionality.

First inspect the existing authentication codebase, then refactor it consistently without breaking unrelated features.
