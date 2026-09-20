# NoteFlow — Integrations

## External Services

### MongoDB Atlas

| Attribute | Value |
|-----------|-------|
| **Service** | MongoDB Atlas |
| **Purpose** | Primary database hosting |
| **Integration Point** | `backend/src/config/db.js` |
| **Authentication** | Connection string in `MONGO_URI` |
| **API Usage** | Mongoose ODM (v9) |
| **Failure Behavior** | App fails to start if connection fails |
| **Configuration** | `MONGO_URI` environment variable |

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
| MongoDB Atlas | Database | Sync | Yes |
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
MongoDB Cloudinary  Brevo
```

All integrations are configured via environment variables and are initialized on application startup.
