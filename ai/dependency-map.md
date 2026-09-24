# ai/dependency-map.md

Dependency Map
==============

Authentication Flow
-------------------
```
Authentication flow:
    register (unverified) → verify-email (6-digit code, auto-login)
    login / session restore (verify endpoint)
    reset-password-code → confirm-password-reset
    ↓
User
    ↓
Notes
    ↓
Notebooks
    ↓
Tags
```

Feature Dependencies
--------------------
```
Notes
    ↓
Notebooks (organize notes)
    ↓
Tags (categorize notes)
    ↓
Search (index content)
```

External Dependencies
---------------------
```
Profile
    ↓
Avatar
    ↓
Cloudinary (upload)
```

```
Password Reset
    ↓
Email
    ↓
Brevo (Sendinblue)
```

Database Dependencies
---------------------
```
User
    ↓
Note
    ↓
Notebook
    ↓
Tag
```

Technical Dependencies
----------------------
**Backend:**
- Express: HTTP server
- Prisma: PostgreSQL ORM
- jsonwebtoken: JWT tokens
- bcrypt: Password hashing
- express-validator: Input validation
- helmet: Security headers
- express-rate-limit: Rate limiting
- multer: File uploads

**Frontend:**
- React: UI framework
- React Router: Navigation
- Zustand: State management
- TanStack Query: Data fetching
- TipTap: Rich text editor
- Tailwind CSS: Styling
- Radix UI: UI primitives
