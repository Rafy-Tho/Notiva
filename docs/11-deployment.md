# NoteFlow — Deployment

## Hosting Platform

Production is split across two providers:

| Part     | Platform             | URL                                    |
| -------- | -------------------- | -------------------------------------- |
| Frontend | Vercel (static SPA)  | `https://noteflow.rafytho.com/`        |
| Backend  | Hostinger (cPanel Node.js) | `https://api-noteflow.rafytho.com/` |

The frontend talks to the backend through `VITE_BASE_API` (CORS + cookie-based auth are configured for this exact split; see [Environment Variables](#runtime-configuration)).

---

## Frontend Deployment (Vercel)

### Build Process

Vercel auto-detects the Vite app (framework preset **Vite**). Build command `npm run build` produces `frontend/dist/` (static files). An SPA rewrite is already configured in `frontend/vercel.json`, so Client-side routes fall back to `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Setup

1. Import the repository into Vercel, root directory `frontend/`.
2. Set the build output to `dist` (automatic with the Vite preset).
3. Add the environment variable below (**build-time**) and redeploy after any change:

| Variable         | Value                                     |
| ---------------- | ----------------------------------------- |
| `VITE_BASE_API`  | `https://api-noteflow.rafytho.com/api/v1` |

4. In **Domains**, add `noteflow.rafytho.com` and point its DNS (Vercel `CNAME`) at Vercel.

---

## Backend Deployment (Hostinger cPanel Node.js)

### Build Process

No build step required (native ESM, no transpilation). The Prisma client is generated automatically:

- `npm start` runs `prisma generate` before booting (`"start": "prisma generate && node src/server.js"`), so generation is guaranteed on every start.
- A `postinstall` script also runs `prisma generate` after `npm install`/`npm ci`.

There is no separate build command in the Hostinger panel. Set the application **Start Script** to **`npm start`** and select a modern Node.js version (v18+). Ensure all required env vars (see below) are set in the Node.js env panel **before the first start** — `prisma generate` fails if it cannot resolve `DATABASE_URL` (loaded via `backend/prisma.config.js`).

Add a domain such as `api-noteflow.rafytho.com` pointing at the app with **HTTPS enabled** (Hostinger auto-provisions Let's Encrypt). HTTPS is mandatory: in `NODE_ENV=production` the auth cookie is `secure` + `SameSite=None`, and a cross-origin `secure` cookie only works over HTTPS.

### Runtime Configuration

| Variable                  | Purpose                                            | Required | Production value |
| ------------------------- | -------------------------------------------------- | -------- | ---------------- |
| `DATABASE_URL`            | PostgreSQL connection string                       | Yes      | cloud database   |
| `JWT_ACCESS_SECRET`       | JWT signing secret                                 | Yes      | secret           |
| `PORT`                    | Server port (assigned by the panel)                | Yes      | panel-assigned   |
| `FRONTEND_ORIGIN`         | CORS origin + CSP `connect-src` (no trailing slash) | Yes      | `https://noteflow.rafytho.com` |
| `NODE_ENV`                | Must be `production`                               | Yes      | `production`     |
| `GOOGLE_CALLBACK_URL`     | OAuth callback (also whitelisted in Google Cloud)  | No*      | `https://api-noteflow.rafytho.com/api/v1/auth/google/callback` |
| `CLOUDINARY_*`            | Avatar upload credentials (required at boot via `validateEnv`) | Yes | cloud credentials |
| `HOSTINGER_*` + `MAIL_FROM*` | Email delivery (required at boot)             | Yes      | mail credentials |
| `JWT_TTL`                 | Token expiration (default: `7d`)                   | No       | `7d`             |
| `LOG_LEVEL`               | Logging threshold (`debug`/`info`/`warn`/`error`)  | No       | `info`           |

\* Google OAuth is optional; when enabled, the callback URL must be registered in the Google Cloud console and point to the production backend.

---

## Database Deployment

**PostgreSQL** (cloud-hosted, e.g. Hostinger/Neon/RDS)

**Configuration:**

- Connection string via `DATABASE_URL`
- Network access configured to allow the backend (Hostinger) IP
- Migrations applied with `npx prisma migrate deploy`

---

## External Services

| Service    | Deployment Requirement                    |
| ---------- | ----------------------------------------- |
| PostgreSQL | Provision cloud database + run migrations |
| Cloudinary | Create account, get credentials           |
| Hostinger Mail | Mail API token (see `docs/13-integrations.md`) |
| Google OAuth | OAuth client (optional) — registered callback must match `GOOGLE_CALLBACK_URL` |

---

## Environment Configuration

### Development

```
NODE_ENV=development
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
VITE_BASE_API=http://localhost:5000/api/v1
```

### Production

```
NODE_ENV=production
PORT=<assigned by host>
FRONTEND_ORIGIN=https://noteflow.rafytho.com
GOOGLE_CALLBACK_URL=https://api-noteflow.rafytho.com/api/v1/auth/google/callback
# Vercel (frontend build env):
VITE_BASE_API=https://api-noteflow.rafytho.com/api/v1
```

---

## Cross-Origin Cookies (Vercel → Hostinger)

Cookie-based auth across two origins relies on:

- **Backend:** `FRONTEND_ORIGIN` exact-match CORS, `credentials: true`, and same-site restrictions relaxed only in production — `secure: true, sameSite: "none"` (see `src/modules/auth/auth.controller.js` and `oauth.controller.js`). `NODE_ENV` **must** be `production` on Hostinger or the cookie will be rejected by the browser.
- **Both domains over HTTPS** — a `Secure` cookie is never sent over HTTP.
- **Frontend:** `fetch` with `credentials: "include"` (`frontend/src/lib/fetchWithAuth.js`).

---

## Deployment Dependencies

| Dependency   | Purpose         |
| ------------ | --------------- |
| Node.js v18+ | Runtime (backend) |
| npm          | Package manager |

---

## Startup Process

```
1. Load environment variables (dotenv + Hostinger panel env)
2. `prisma generate` (start script)
3. Connect to PostgreSQL (Prisma `$connect`)
4. Initialize Express app
5. Set up middleware (helmet, cors, etc.)
6. Register routes
7. Listen on PORT
```

---

## Configuration Differences

| Aspect      | Development                           | Production              |
| ----------- | ------------------------------------- | ----------------------- |
| Logging     | Custom logger + httpLogger (detailed) | Custom logger (minimal) |
| Error stack | Included                              | Excluded                |
| CORS        | `http://localhost:5173`               | `https://noteflow.rafytho.com` |
| Database    | PostgreSQL (dev)                      | PostgreSQL (prod)       |
| Cookies     | `secure=false`, `SameSite=Lax`        | `secure=true`, `SameSite=None` |