# ai/architecture-rules.md

Architectural Patterns
======================

Data Flow
---------
```
Frontend
    ↓
API Client (fetchWithAuth)
    ↓
HTTP API (/api/v1/*)
    ↓
Routes
    ↓
Controllers
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Database (MongoDB/Mongoose)
```

Backend Architecture
--------------------
**Module-based pattern:**
- Each feature has its own folder: auth/, users/, notes/, notebooks/, tags/
- Each module contains: controller.js, service.js, repository.js, routes.js, validation.js

**Service-layer pattern:**
- Services contain business logic
- Controllers handle request/response only
- Controllers call services for data operations

**Repository pattern:**
- Repositories handle all database queries
- Services call repositories instead of accessing models directly
- One repository per module

**Controller pattern:**
- Uses express-validator for input validation
- Wraps all handlers with asyncHandler middleware

**Validation pattern:**
- Validators in src/modules/*/validation.js
- Used as middleware before controller
- Custom error messages defined in validators

**Response pattern:**
```javascript
{
  success: boolean,
  data: any,
  code: number,
  message: string
}
```

Frontend Architecture
---------------------
**State management:**
- Zustand stores with localStorage persistence (global: authStore, useUIStore)
- TanStack Query for server state caching

**Routing pattern:**
- PublicRoute/PrivateRoute wrappers
- createBrowserRouter setup in App.jsx

**Component pattern:**
- Feature-based organization (`features/notes/`, `features/notebooks/`, `features/tags/`, `features/auth/`)
- Each feature contains: components/, hooks/, pages/
- Shared UI in `components/common/` (shadcn primitives)
- Shared layout in `components/layout/`
- Custom hooks in feature hooks/ and shared hooks/

Key Conventions
---------------
- ES modules only (no CommonJS)
- Async/await everywhere with error middleware
- Centralized config (src/config/env.js)
- Shared utilities in src/common/ (middleware, utils, errors)
- Module-based folder structure
- userId filtering on all database queries
- Soft delete (deletedAt) on all entities
- camelCase naming throughout
