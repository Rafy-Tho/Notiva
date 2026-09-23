# NoteFlow — Environment

## Environment Variables

### Backend Variables

#### Required
| Name | Purpose | Default |
|------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma) | - |
| `JWT_ACCESS_SECRET` | Secret key for JWT signing | - |
| `PORT` | Server listening port | - |
| `FRONTEND_ORIGIN` | Allowed CORS origin | - |

#### Optional
| Name | Purpose | Default |
|------|---------|---------|
| `JWT_TTL` | Token expiration time | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `HOSTINGER_MAIL_API_KEY` | Hostinger API key for email | - |
| `HOSTINGER_MAIL_MAILBOX_ID` | Hostinger mailbox ID | - |
| `MAIL_FROM` | Email sender address | - |
| `MAIL_FROM_NAME` | Email sender name | - |
| `NODE_ENV` | Environment mode | `development` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (Google Login) | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (Google Login) | - |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL that must be whitelisted in the Google Cloud console (e.g. `http://localhost:5000/api/v1/auth/google/callback`) | - |

---

### Frontend Variables

#### Required
| Name | Purpose | Access |
|------|---------|--------|
| `VITE_BASE_API` | Backend API base URL | `import.meta.env.VITE_BASE_API` |

---

## Configuration Files

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your-secret-key
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
JWT_TTL=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
HOSTINGER_MAIL_API_KEY=...
HOSTINGER_MAIL_MAILBOX_ID=...
HOSTINGER_API_BASE_URL=https://api.mail.hostinger.com
MAIL_FROM=noreply@...
MAIL_FROM_NAME=NoteFlow
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```
VITE_BASE_API=http://localhost:5000/api/v1
```

---

## Environment-Specific Settings

### Development
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `development` |
| `PORT` | `5000` |
| `FRONTEND_ORIGIN` | `http://localhost:5173` |
| `VITE_BASE_API` | `http://localhost:5000/api/v1` |
| `NODE_ENV` | `development` |

### Production
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | Assigned by host |
| `FRONTEND_ORIGIN` | `https://yourapp.onrender.com` |
| `VITE_BASE_API` | `https://yourapp.onrender.com/api/v1` |
| `NODE_ENV` | `production` |

---

## Required Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| PostgreSQL | Primary database | DATABASE_URL |
| Cloudinary | Avatar storage | CLOUDINARY_* |
| Hostinger | Email delivery | HOSTINGER_MAIL_* |

---

## Configuration Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| API Base | localhost:5000 | Render domain |
| Frontend Origin | localhost:5173 | Render domain |
| Cookie secure | false | true |
| Database | PostgreSQL | PostgreSQL |
| Logging | Verbose (morgan) | Minimal |

---

## Secrets Management

**Security:**
- Secrets stored in `.env` files
- Never committed to source control
- Required for application to start
- Backend and frontend use separate environments

**Note:** Actual secret values should not be exposed in documentation or logs.
