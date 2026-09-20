# NoteFlow — Architecture

## Frontend Architecture

### Technology Stack
| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| State Management | Zustand 5 (client), TanStack Query 5 (server) |
| Routing | React Router 7 |
| Editor | TipTap 3 |
| UI Components | Radix UI |
| Icons | Lucide React |
| Forms | cmdk (command palette) |

### Component Hierarchy
```
App.jsx (Root)
├── QueryClientProvider (TanStack Query)
└── RouterProvider (React Router)
    └── AppLayout
        ├── Sidebar (collapsible)
        │   ├── ActionButtons (New note, Search)
        │   ├── NavSections (All, Favorites, Archive, Trash)
        │   ├── NotebooksSection
        │   ├── TagsSection
        │   └── UserSection
        ├── AppHeader
        │   ├── SidebarToggle
        │   ├── Logo
        │   ├── Search
        │   ├── New Note Button
        │   └── User Avatar
        ├── <Outlet/> (Page content)
        └── CommandPalette
```

### State Management Architecture
```
Client State (Zustand)
├── authStore (user, isAuthenticated, login, logout)
└── useUIStore (theme, fontSize, sidebar - persisted to localStorage)

Server State (TanStack Query)
├── Notes queries/mutations
├── Notebooks queries/mutations
├── Tags queries/mutations
└── User profile queries/mutations
```

### File Organization

**Feature-based organization:**
| Location | Purpose |
|----------|---------|
| `features/notes/` | Note-related pages, components, and hooks |
| `features/notebooks/` | Notebook UI and hooks |
| `features/tags/` | Tag UI and hooks |
| `features/auth/` | Authentication pages and hooks |
| `components/layout/` | App-level layout components |
| `components/common/` | Reusable UI primitives (shadcn) |

**Shared resources:**
| File | Purpose |
|------|---------|
| `app/App.jsx` | Root entry point with router |
| `store/authStore.js` | Global authentication state |
| `store/useUIStore.js` | UI settings persistence |
| `hooks/useNotes.js` | Note CRUD hooks (in features/notes/) |
| `hooks/useAutosave.js` | Auto-save logic |

---

## Backend Architecture

### Technology Stack
| Component | Technology |
|-----------|------------|
| Runtime | Node.js (native ESM) |
| Framework | Express 5 |
| Database ODM | Mongoose 9 |
| Validation | express-validator |
| Security | bcrypt, jsonwebtoken, helmet, cors |

### Layered Architecture
```
Request
    ↓
Middleware Chain
├── helmet (security headers)
├── cors (CORS handling)
├── cookie-parser (JWT cookie)
├── express.json (body parsing, 2MB limit)
├── morgan (dev logging)
├── generalLimiter (100/min)
└── Route-specific middleware
    ├── authenticate (protected routes)
    ├── authLimiter (auth endpoints: 10/min)
    └── validate (express-validator chains)
    ↓
Controller Layer (request/response handling)
    ↓
Service Layer (business logic)
    ↓
Repository Layer (data access)
    ↓
Model Layer (Mongoose schemas)
    ↓
Database (MongoDB Atlas)
```

### Key Files
| File | Purpose |
|------|---------|
| `backend/src/server.js` | Server entry point |
| `backend/src/app/app.js` | Express app configuration |
| `backend/src/common/middleware/authenticate.js` | JWT verification |
| `backend/src/modules/*/routes.js` | Route definitions |
| `backend/src/modules/*/controller.js` | Request handlers |
| `backend/src/modules/*/service.js` | Business logic |
| `backend/src/modules/*/repository.js` | Data access layer |

---

## Database Architecture

### Schema
```
User
├── _id (ObjectId, PK)
├── name (String)
├── email (String, unique, indexed)
├── password (String, bcrypt hashed)
├── avatar (String, Cloudinary URL)
├── resetToken (String, SHA-256 hashed)
├── resetTokenExpires (Date)
├── deletedAt (Date, soft delete)
├── createdAt (Date)
└── updatedAt (Date)

Note
├── _id (ObjectId, PK)
├── title (String)
├── content (String, HTML)
├── userId (ObjectId, FK → User, indexed)
├── notebookId (ObjectId, FK → Notebook, indexed)
├── tagIds (Array of ObjectId, indexed)
├── isPinned (Boolean)
├── isFavorite (Boolean)
├── isArchived (Boolean)
├── cover (Object: {color, emoji})
├── wordCount (Number)
├── deletedAt (Date, soft delete)
├── createdAt (Date)
└── updatedAt (Date)

Notebook
├── _id (ObjectId, PK)
├── name (String, unique per user)
├── color (String)
├── userId (ObjectId, FK → User, indexed)
├── deletedAt (Date, soft delete)
├── createdAt (Date)
└── updatedAt (Date)

Tag
├── _id (ObjectId, PK)
├── name (String, unique per user)
├── color (String)
├── userId (ObjectId, FK → User, indexed)
├── deletedAt (Date, soft delete)
├── createdAt (Date)
└── updatedAt (Date)
```

### Relationships
```
User (1) ──< Notes (N)
User (1) ──< Notebooks (N)
User (1) ──< Tags (N)
Notebook (1) ──< Notes (N)
Tag (N) ── Notes (N) [via tagIds array]
```

### Indexes
| Collection | Index |
|------------|-------|
| User | email (unique) |
| Note | userId, notebookId, tagIds (array), title+content (text) |
| Notebook | userId+name (unique compound) |
| Tag | userId+name (unique compound) |

---

## Request Flow

### Authenticated Request
```
Browser → HTTPS
    ↓
Backend Server (express/app.js)
    ↓
Middleware: helmet, cors, cookie-parser, express.json, morgan
    ↓
Rate Limiting (express-rate-limit)
    ↓
authRequired middleware (JWT verification)
    ↓
Route-specific validation
    ↓
Controller (extracts data, calls service)
    ↓
Service (business logic, DB operations)
    ↓
Mongoose (query/transform)
    ↓
MongoDB Atlas
    ↓
Response back through middleware chain
```

---

## Authentication Flow

### Session Lifecycle
```
1. Login → POST /auth/login
   ↓
2. Service verifies credentials (bcrypt)
   ↓
3. Controller sets httpOnly JWT cookie (noteflow_token)
   ↓
4. JWT contains: { id, email, name }, expiry: 7 days
   ↓
5. Browser includes cookie on all requests
   ↓
6. authRequired middleware verifies JWT signature
   ↓
7. User ID extracted for ownership validation
```

### Session Restore
```
App Mount →
    ↓
authStore.restoreSession() called
    ↓
GET /api/v1/auth/verify
    ↓
authRequired validates cookie
    ↓
me.service.get() fetches user
    ↓
200 → set user, PrivateRoute renders
401 → set user=null, PublicRoute shows login
```

---

## Major Services

| Service | Purpose |
|---------|---------|
| `auth.service.js` | Registration, login, password reset |
| `notes.service.js` | CRUD, search, filtering |
| `notebooks.service.js` | Notebook CRUD |
| `tags.service.js` | Tag CRUD |
| `upload.service.js` | Cloudinary image uploads |
| `mailer.js` | Email delivery (Brevo) |

---

## Dependencies

### External Services
| Service | Protocol | Usage |
|---------|----------|-------|
| MongoDB Atlas | Mongoose ODM | Primary database |
| Cloudinary | REST API | Avatar image hosting |
| Brevo | REST API | Email delivery |

### Key Internal Dependencies
| Module | Purpose |
|--------|---------|
| `common/middleware/authenticate.js` | JWT verification |
| `common/middleware/rateLimiter.js` | Rate limiting |
| `common/utils/tokens.js` | JWT generation |
| `common/utils/html.js` | HTML sanitization |
