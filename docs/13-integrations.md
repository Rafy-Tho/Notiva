# NoteFlow — Integrations

## External Services

### PostgreSQL

| Attribute | Value |
|-----------|-------|
| **Service** | PostgreSQL |
| **Purpose** | Primary database |
| **Integration Point** | `backend/src/db/prisma.js` (shared PrismaClient) |
| **Authentication** | Connection string in `DATABASE_URL` |
| **API Usage** | Prisma ORM v7 + `@prisma/adapter-pg` |
| **Failure Behavior** | App fails to start if connection fails |
| **Configuration** | `DATABASE_URL` environment variable |

---

### Cloudinary

| Attribute | Value |
|-----------|-------|
| **Service** | Cloudinary |
| **Purpose** | Avatar image hosting |
| **Integration Point** | `backend/src/services/upload.service.js` |
| **Authentication** | API key and secret |
| **API Usage** | Upload API for image storage |
| **Failure Behavior** | Upload endpoint returns error |
| **Configuration** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

---

### Hostinger (via REST API)

| Attribute | Value |
|-----------|-------|
| **Service** | Hostinger |
| **Purpose** | Email delivery (verification + password reset) |
| **Integration Point** | `backend/src/modules/email/email.service.js` |
| **Authentication** | Bearer token (API key) |
| **API Usage** | `POST /api/v1/mailboxes/{mailboxResourceId}/send` (accepts `204 No Content`). Payload follows the `V1.Send.Request` schema: `to` (array of email strings), `displayName`, `cc?`, `bcc?`, `subject`, `text`, `html`, `attachments?`, `inReplyTo?`, `forwardOf?` |
| **Recovery** | 10s request timeout, 3 attempts, jittered exponential backoff (300ms→5s cap), honors `Retry-After`; retries only on timeout/network/429/5xx |
| **Failure Behavior** | Client errors (400/401/403/404/422) are permanent and surface as an error. For `/auth/register` and password-reset requests the send is non-fatal: the failure is logged and the endpoint still returns success (user can retry via `/verify-email/resend`). Logs only non-sensitive metadata (never recipient, codes, or content) |
| **Configuration** | `HOSTINGER_MAIL_API_KEY`, `HOSTINGER_MAIL_MAILBOX_ID`, `HOSTINGER_API_BASE_URL`, `MAIL_FROM`, `MAIL_FROM_NAME` (used as `displayName`) |

### Google (OAuth 2.0 / OpenID Connect)

| Attribute | Value |
|-----------|-------|
| **Service** | Google |
| **Purpose** | "Sign in with Google" (server-side Authorization Code flow) |
| **Integration Point** | `backend/src/modules/auth/oauth.service.js`, `oauth.controller.js`, `oauth.repository.js` |
| **Authentication** | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (confidential client, secret never leaves the backend) |
| **API Usage** | `https://accounts.google.com/o/oauth2/v2/auth` (auth URL), `https://oauth2.googleapis.com/token` (code exchange), `https://www.googleapis.com/oauth2/v3/certs` (JWKS for ID-token signature verification). Implemented with Node built-in `fetch` + `node:crypto` — no SDK dependency |
| **Failure Behavior** | Cancelled login / invalid state / invalid callback / verify failures redirect to `FRONTEND_ORIGIN/login?oauth_error=<key>`. Exchange/verify failures are logged (dev) and surfaced generically; Google UIDs (`sub`) are the only identity used, never the email |
| **Configuration** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (optional; Google Login buttons error gracefully when unset) |

---

## Integration Summary

| Service | Type | Sync/Async | Required |
|---------|------|------------|----------|
| PostgreSQL | Database | Sync | Yes |
| Cloudinary | Storage | Sync | No |
| Hostinger | Email | Sync | No |
| Google | OAuth 2.0 / OIDC | Sync | No |

---

## Configuration Dependencies

```
NoteFlow Backend
    │
    ├───┬────────────┐
    │   │            │
    ▼   ▼            ▼
PostgreSQL Cloudinary  Hostinger
```

All integrations are configured via environment variables and are initialized on application startup.
