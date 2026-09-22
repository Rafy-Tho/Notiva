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

### Brevo (via Nodemailer)

| Attribute | Value |
|-----------|-------|
| **Service** | Brevo (Sendinblue) |
| **Purpose** | Email delivery (password reset) |
| **Integration Point** | `backend/src/config/mailer.js` |
| **Authentication** | API key |
| **API Usage** | Email sending via REST API |
| **Failure Behavior** | Email send fails silently |
| **Configuration** | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` |

---

## Integration Summary

| Service | Type | Sync/Async | Required |
|---------|------|------------|----------|
| PostgreSQL | Database | Sync | Yes |
| Cloudinary | Storage | Sync | No |
| Brevo | Email | Sync | No |

---

## Configuration Dependencies

```
NoteFlow Backend
    │
    ├───┬────────────┐
    │   │            │
    ▼   ▼            ▼
PostgreSQL Cloudinary  Brevo
```

All integrations are configured via environment variables and are initialized on application startup.
