# Environment Variables

## Backend

### Required

| Name | Purpose | Used In |
|------|---------|---------|
| `MONGO_URI` | MongoDB connection string | `config/db.js` |
| `JWT_ACCESS_SECRET` | JWT signing secret | `utils/tokens.js` |
| `PORT` | Server port | `server.js` |
| `FRONTEND_ORIGIN` | Allowed CORS origins | `app.js` |

### Optional

| Name | Purpose | Default | Used In |
|------|---------|---------|---------|
| `JWT_TTL` | Token expiration | `7d` | `utils/tokens.js` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | `config/cloudinary.js` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | `config/cloudinary.js` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | `config/cloudinary.js` |
| `BREVO_API_KEY` | Brevo email API key | - | `config/mailer.js` |
| `BREVO_SENDER_EMAIL` | Email sender address | - | `config/mailer.js` |
| `NODE_ENV` | Environment mode | `development` | Multiple |

## Frontend

### Required

| Name | Purpose | Used In |
|------|---------|---------|
| `VITE_BASE_API` | Backend API URL | `store/authStore.js` |

### Optional

| Name | Purpose | Used In |
|------|---------|---------|
| `NODE_ENV` | Build mode | Build process |

## Configuration

| File | Purpose |
|------|---------|
| `backend/.env` | Runtime configuration |
| `backend/.env.example` | Template for new environments |

## Docker

Unknown - no Docker files detected.

## CI/CD

Unknown - no CI/CD configuration detected.

---

## Usage in Code

### Backend Example
```javascript
import "dotenv/config";

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
```

### Frontend Example
```javascript
const BASE_URL = import.meta.env.VITE_BASE_API;
```

---

## Unknowns

| Item | Status |
|------|--------|
| `.env.example` file | UNKNOWN - not found in repository |
| Dockerfile | UNKNOWN - not found |
| GitHub Actions / other CI | UNKNOWN - not found |
