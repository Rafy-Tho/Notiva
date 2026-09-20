# Backend Architecture & Folder Structure Refactoring

You are a senior backend engineer responsible for reviewing and refactoring the existing backend architecture.

Your task is to **audit the current backend, identify architectural problems, and refactor it toward the target feature/module-based architecture below**.

Do not blindly move or rename files. First understand how the existing backend works and what dependencies exist.

---

## 1. Primary Objective

Improve the backend's:

- Architecture
- Folder structure
- Separation of responsibilities
- Module boundaries
- Dependency direction
- Maintainability
- Testability
- Code organization

The refactor must **preserve existing functionality and API behavior unless a change is explicitly required**.

Do not introduce unnecessary abstractions or complexity.

---

## 2. Target Architecture

Use this as the target structure:

```text
backend/
├── src/
│   ├── app/
│   │   ├── app.js
│   │   ├── routes.js
│   │   └── middleware.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── session.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.constants.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── notes/
│   │   │   ├── note.controller.js
│   │   │   ├── note.service.js
│   │   │   ├── note.repository.js
│   │   │   ├── note.routes.js
│   │   │   └── note.validation.js
│   │   │
│   │   └── notebooks/
│   │       ├── notebook.controller.js
│   │       ├── notebook.service.js
│   │       ├── notebook.repository.js
│   │       ├── notebook.routes.js
│   │       └── notebook.validation.js
│   │
│   ├── common/
│   │   ├── errors/
│   │   │   ├── AppError.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── authorize.js
│   │   │   ├── rateLimiter.js
│   │   │   └── notFound.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── pagination.js
│   │   │   └── response.js
│   │   │
│   │   └── constants/
│   │       └── roles.js
│   │
│   └── server.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

This structure is a **guideline, not a requirement to create every file**.

Only create a file when the responsibility actually exists and separating it improves the architecture.

---

## 3. Phase 1 — Inspect Before Changing Anything

Before modifying the code, inspect the entire backend.

Identify:

- Current folder structure
- Application entry point
- Server startup
- Express/framework setup
- Route definitions
- Controllers
- Services
- Database access
- Authentication
- Authorization
- Validation
- Middleware
- Configuration
- Error handling
- Logging
- Utilities
- Constants
- External services
- Tests
- Database models/queries
- Environment-variable usage
- Module imports/exports
- Existing architectural patterns

Do not make changes during this phase.

---

## 4. Phase 2 — Build an Architecture Map

Determine how the current backend actually works.

Create a dependency map similar to:

```text
server
  ↓
application
  ↓
routes
  ↓
controllers
  ↓
services
  ↓
repositories
  ↓
database
```

Also identify:

- Modules that bypass layers
- Controllers accessing databases directly
- Routes containing business logic
- Services containing HTTP-specific logic
- Repositories depending on HTTP objects
- Modules directly accessing another module's repository
- Circular dependencies
- Shared code with unclear ownership
- Global state
- Hidden dependencies

Do not assume the existing architecture matches the folder names.

Use actual imports and execution flow to determine the architecture.

---

## 5. Phase 3 — Identify Architectural Problems

Find and document:

### Folder Structure Problems

- Misplaced files
- Mixed responsibilities
- Feature code scattered across unrelated directories
- Infrastructure mixed with business logic
- Inconsistent naming
- Duplicate directories
- Unnecessary directories
- Dead directories

### Responsibility Problems

Identify:

- Business logic inside routes
- Business logic inside controllers
- Database logic inside controllers
- HTTP logic inside services
- Validation mixed with business logic
- Authentication logic duplicated across modules
- Shared logic duplicated between features

### Dependency Problems

Identify:

- Circular dependencies
- Incorrect dependency direction
- Tight coupling
- Cross-module repository access
- Modules depending on implementation details
- Unnecessary dependencies

### Maintainability Problems

Identify:

- Very large files
- Very large functions
- God modules
- Duplicate code
- Generic `utils` dumping grounds
- Generic `helpers` dumping grounds
- Unclear names
- Unused code

---

## 6. Phase 4 — Define the Refactoring Plan

Before implementing the refactor, create a concise plan.

For every significant change, identify:

```text
Current location
Current responsibility
Problem
Target location
Target responsibility
Reason for change
Risk
```

Example:

```text
Current:
src/routes/noteRoutes.js

Problem:
Contains routes, validation, database queries, and business logic.

Target:
src/modules/notes/
├── note.routes.js
├── note.controller.js
├── note.service.js
├── note.repository.js
└── note.validation.js

Reason:
Separate HTTP handling, business logic, validation, and persistence.
```

Do not start implementation until the target structure and dependency direction are understood.

---

## 7. Phase 5 — Refactor

Refactor incrementally.

Preferred order:

```text
1. Configuration/infrastructure
2. Common application infrastructure
3. Authentication
4. Users
5. Notes
6. Notebooks
7. Remaining modules
8. Remove obsolete files
```

For each module:

```text
Inspect
  ↓
Move/extract
  ↓
Fix imports
  ↓
Run tests
  ↓
Verify behavior
  ↓
Continue
```

Do not perform a destructive full rewrite unless absolutely necessary.

---

## 8. Architectural Rules

### Routes

Routes should primarily define:

- HTTP method
- URL
- Middleware
- Validation
- Controller handler

Routes must not contain business logic or database queries.

---

### Controllers

Controllers should handle HTTP concerns:

- Read request data
- Call services
- Return HTTP responses

Controllers should not contain substantial business logic or direct database queries.

---

### Services

Services contain business rules and application logic.

Services should not depend on Express `req`/`res` objects unless there is a concrete architectural reason.

---

### Repositories

Repositories handle persistence/data access.

Repositories should contain:

- Database queries
- Persistence operations
- Data-access-specific logic

Repositories should not contain HTTP response handling.

---

### Validation

Validation should be separated from business logic where practical.

Validate:

- Request body
- Query parameters
- Path parameters
- Relevant headers

Do not rely solely on frontend validation.

---

### Middleware

Middleware should handle cross-cutting request concerns such as:

- Authentication
- Authorization
- Rate limiting
- Request processing
- Error handling
- Not-found handling

Do not put feature-specific business logic into generic middleware.

---

### Configuration

Centralize application configuration.

Avoid scattered direct access to environment variables throughout the application.

Prefer:

```text
process.env
    ↓
config
    ↓
application
```

rather than:

```text
module A → process.env
module B → process.env
module C → process.env
module D → process.env
```

---

## 9. Module Boundary Rules

Each feature should own its business functionality.

For example:

```text
auth
users
notes
notebooks
```

Avoid:

```text
notes.service
    ↓
users.repository
```

when the notes module can instead use an appropriate public service/interface:

```text
notes.service
    ↓
users.service
    ↓
users.repository
```

Do not allow modules to depend directly on another module's internal implementation unless there is a justified architectural reason.

---

## 10. Common Directory Rules

`common/` is only for genuinely shared functionality.

Before placing code into:

```text
common/utils/
```

ask:

> Is this truly shared infrastructure, or does it belong to a specific feature?

Do not create:

```text
common/utils/
├── noteHelper.js
├── userHelper.js
├── authHelper.js
├── randomHelper.js
└── misc.js
```

Move feature-specific logic into its owning module.

---

## 11. Circular Dependency Check

After refactoring, explicitly check for circular dependencies.

Example:

```text
A → B
B → C
C → A
```

If a circular dependency exists:

1. Identify why it exists.
2. Determine whether responsibilities are incorrectly coupled.
3. Move shared responsibility to an appropriate abstraction.
4. Simplify the dependency relationship.
5. Do not blindly move code into `common/`.

---

## 12. File and Naming Rules

Use consistent naming.

Prefer:

```text
note.controller.js
note.service.js
note.repository.js
note.routes.js
note.validation.js
```

Use names that communicate responsibility.

Avoid vague names such as:

```text
helper.js
manager.js
misc.js
stuff.js
common.js
data.js
temp.js
```

Do not rename files merely for cosmetic reasons if doing so creates unnecessary churn.

---

## 13. Large File and Function Review

Identify files/functions that have too many responsibilities.

Before splitting a large file, determine:

- What responsibilities does it contain?
- Which responsibility belongs together?
- Which code is reused?
- Which code is feature-specific?
- Will splitting improve maintainability?
- Will splitting create unnecessary complexity?

Do not split code simply because a file is large.

---

## 14. Preserve Existing Behavior

During this architecture refactor:

**Do not intentionally change:**

- API endpoint behavior
- Authentication behavior
- Authorization behavior
- Database semantics
- Validation behavior
- Response contracts
- Error contracts
- Session behavior
- Existing feature behavior

unless explicitly required.

If you discover a bug while refactoring:

1. Document it.
2. Determine whether fixing it is safe.
3. Avoid silently changing behavior.
4. Clearly report it.

---

## 15. Verification

After each significant refactoring step, verify:

```text
✓ Application starts
✓ Imports resolve
✓ Tests pass
✓ API tests pass
✓ Lint passes
✓ No circular dependencies
✓ Existing endpoints still work
✓ Authentication still works
✓ Database operations still work
✓ Error handling still works
```

Do not declare the refactor complete if verification fails.

Fix regressions before continuing.

---

## 16. Final Architecture Audit

At the end, verify:

- [ ] Clear feature/module boundaries
- [ ] Routes contain no business logic
- [ ] Controllers handle HTTP concerns
- [ ] Services contain business logic
- [ ] Repositories contain data-access logic
- [ ] Validation is appropriately separated
- [ ] Configuration is centralized
- [ ] Shared infrastructure is genuinely shared
- [ ] No circular dependencies
- [ ] No unnecessary cross-module coupling
- [ ] No duplicated architectural responsibilities
- [ ] No dead files
- [ ] No unnecessary files
- [ ] No `utils` dumping ground
- [ ] Naming is consistent
- [ ] Large files/functions have been reviewed
- [ ] Existing functionality is preserved
- [ ] Tests pass
- [ ] Lint passes
- [ ] Application starts successfully

---

## 17. Final Report

When finished, provide a concise report containing:

### Architecture Before

```text
Describe the important problems in the original structure.
```

### Architecture After

```text
Describe the new structure and boundaries.
```

### Files Moved

List important files that were moved.

### Files Created

List newly created files.

### Files Deleted

List files removed and why.

### Architectural Improvements

Explain the important improvements.

### Risks / Remaining Issues

List anything that could not safely be resolved.

### Verification

Report:

```text
Tests: PASS/FAIL
Lint: PASS/FAIL
Application startup: PASS/FAIL
Circular dependency check: PASS/FAIL
API regression check: PASS/FAIL
```

### Important Rule

**Do not optimize for having the exact target folder tree. Optimize for a clean, understandable, maintainable architecture that fits the actual application.**

If the existing application does not need a particular layer or file, do not create it just to match the example.

**Inspect → Understand → Plan → Refactor → Verify → Report.**
