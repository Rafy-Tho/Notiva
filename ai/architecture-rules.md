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
Database (MongoDB/Mongoose)
```

Backend Architecture
--------------------
**Service-layer pattern:**
- Services contain business logic
- Controllers handle request/response only
- Controllers call services for data operations

**Controller pattern:**
- One controller per resource (auth, me, notes, notebooks, tags)
- Uses express-validator for input validation
- Wraps all handlers with asyncHandler middleware

**Validation pattern:**
- Validators in src/validators/
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
- Zustand stores with localStorage persistence
- TanStack Query for server state caching

**Routing pattern:**
- PublicRoute/PrivateRoute wrappers
- createBrowserRouter setup in App.jsx

**Component pattern:**
- Feature-based organization (components/pages/editor/hooks/store)
- Shadcn-like UI primitives from Radix
- Custom hooks for reusable logic

Key Conventions
---------------
- ES modules only (no CommonJS)
- Async/await everywhere with error middleware
- userId filtering on all database queries
- Soft delete (deletedAt) on all entities
- camelCase naming throughout
