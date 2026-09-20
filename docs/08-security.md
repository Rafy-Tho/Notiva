# NoteFlow — Security

## Authentication Security

### Password Handling
| Aspect | Implementation |
|--------|----------------|
| **Hashing** | bcrypt with cost 12 |
| **Storage** | Hash only (never plaintext) |
| **Transmission** | HTTPS only |
| **Reset** | SHA-256 hashed token, 1-hour expiry |

### Session Management
| Aspect | Implementation |
|--------|----------------|
| **Token Type** | JWT in httpOnly cookie |
| **Cookie Name** | `noteflow_token` |
| **Secure Flag** | true (HTTPS only) |
| **SameSite** | lax (prevents CSRF) |
| **Expiry** | 7 days |

---

## Input Validation

| Source | Validation |
|--------|------------|
| **Body** | express-validator chains |
| **Password** | Min 8 chars, uppercase, lowercase, digit, special char |
| **Email** | Valid email format |
| **Names** | Length and character restrictions |

---

## XSS Protection

| Layer | Implementation |
|-------|----------------|
| **Client** | DOMPurify sanitizes HTML before rendering |
| **Server** | sanitize-html cleans content before storage |

---

## CORS

| Setting | Value |
|---------|-------|
| **Allowed Origins** | Configurable via `FRONTEND_ORIGIN` env |
| **Credentials** | Included (required for cookies) |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/*` | 10 requests | 1 minute |
| All other routes | 100 requests | 1 minute |

**Implementation:** express-rate-limit with Redis backend (ioredis)

---

## Security Headers (Helmet)

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | SAMEORIGIN |
| X-XSS-Protection | 1; mode=block |
| Strict-Transport-Security | Max-age included (HTTPS) |

---

## SQL/NoSQL Injection Protection

| Protection | Implementation |
|------------|----------------|
| **Query escaping** | Mongoose handles escaping |
| **Input validation** | express-validator sanitizes inputs |
| **No raw queries** | All queries use Mongoose methods |

---

## File Upload Security

| Aspect | Implementation |
|--------|----------------|
| **File type** | Restricted to images (via Cloudinary) |
| **Storage** | Cloudinary cloud storage |
| **Client-side** | DOMPurify cleans uploaded image references |

---

## Secrets Management

| Secret | Environment Variable |
|--------|---------------------|
| JWT signing key | `JWT_ACCESS_SECRET` |
| MongoDB connection | `MONGO_URI` |
| Cloudinary credentials | `CLOUDINARY_*` |
| Brevo API key | `BREVO_API_KEY` |

**Storage:**
- Secrets stored in `.env` files
- Never committed to source control
- Required for application startup

---

## Logging

| Type | Implementation |
|------|----------------|
| **Request logging** | morgan in development mode |
| **Security events** | Not explicitly logged |
| **Error logging** | Global error handler |

---

## Security Audit

| Control | Status |
|---------|--------|
| Password hashing | ✅ bcrypt cost 12 |
| Cookie security | ✅ httpOnly, secure, sameSite |
| Input validation | ✅ express-validator |
| XSS protection | ✅ sanitize-html + DOMPurify |
| Rate limiting | ✅ 10/min auth, 100/min general |
| HTTPS enforcement | ✅ secure cookie flag |
| CORS | ✅ Configurable origin |
| Security headers | ✅ helmet |
| Secret protection | ✅ Environment variables |
