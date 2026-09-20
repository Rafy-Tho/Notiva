# NoteFlow — Environment

## Environment Variables

### Backend Variables

#### Required
| Name | Purpose | Default |
|------|---------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | - |
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
| `BREVO_API_KEY` | Brevo API key for email | - |
| `BREVO_SENDER_EMAIL` | Email sender address | - |
| `NODE_ENV` | Environment mode | `development` |

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
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-secret-key
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
JWT_TTL=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=noreply@...
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
| MongoDB Atlas | Primary database | MONGO_URI |
| Cloudinary | Avatar storage | CLOUDINARY_* |
| Brevo | Email delivery | BREVO_* |

---

## Configuration Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| API Base | localhost:5000 | Render domain |
| Frontend Origin | localhost:5173 | Render domain |
| Cookie secure | false | true |
| Database | Atlas cluster | Atlas cluster |
| Logging | Verbose (morgan) | Minimal |

---

## Secrets Management

**Security:**
- Secrets stored in `.env` files
- Never committed to source control
- Required for application to start
- Backend and frontend use separate environments

**Note:** Actual secret values should not be exposed in documentation or logs.
