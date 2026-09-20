# ai/coding-rules.md

Coding Conventions
==================

Naming
------
- camelCase for variables, functions, properties
- PascalCase for components, classes, types
- SCREAMING_SNAKE_CASE for constants
- Files: lowercase with hyphens (e.g., fetchWithAuth.js)

File Organization
-----------------
**Backend:**
- controllers/ - Request handlers per resource
- services/ - Business logic per resource
- models/ - Mongoose schemas
- routes/ - API route definitions
- validators/ - express-validator schemas
- middleware/ - Shared middleware
- utils/ - Utility functions
- config/ - Environment configuration

**Frontend:**
- components/ - Reusable UI
- pages/ - Page components
- editor/ - TipTap components
- hooks/ - Custom React hooks
- lib/ - Utilities
- store/ - Zustand stores

Imports
-------
- ESM style: `import x from 'y'`
- Absolute paths: `@/components/Button`
- Relative paths for local: `./utils/format`
- External first, then local

Error Handling
--------------
- Use asyncHandler middleware wrapper
- Standard response: {success: false, code: error_code, message: "..."}
- Express error middleware in src/middleware/error.js

Validation
----------
- Use express-validator with custom schemas
- Validate in middleware before controller
- Custom error messages in validator definitions

API Patterns
------------
- Base path: /api/v1/*
- Resource endpoints: /notes, /notebooks, /tags
- CRUD: GET, POST, PATCH, DELETE
- Query params: search, filter, page, limit
- Response format: {success, data, code, message}

Database Patterns
-----------------
- All queries filter by userId (ownership)
- Use .lean() for read-only queries
- Check deletedAt before returning documents
- Use populate() for relationships
- Indexes: text on title/content, compound on (userId, name)

Frontend Patterns
-----------------
- Zustand stores: define in store/, use in components
- TanStack Query: useQuery, useMutation, optimistic updates
- Tailwind classes: utility-first, inline styling
- Forms: controlled inputs with onChange handlers

Testing Patterns
----------------
- Vitest with jsdom (frontend) or node (backend)
- Use vi.hoisted() for service mocking
- Test service layer primarily
- Mock external dependencies (DB, Cloudinary, etc.)
