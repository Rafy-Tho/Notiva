We are migrating this existing application from MongoDB/Mongoose to PostgreSQL/Prisma.

Goal:
Replace MongoDB + Mongoose with PostgreSQL + Prisma while preserving all existing application behavior, APIs, UI behavior, authentication, validation, business logic, and features.

IMPORTANT:

- Do NOT rewrite the application unnecessarily.
- Do NOT change the frontend unless required by API/data-shape changes.
- Do NOT remove existing features.
- Do NOT introduce TypeScript. Keep JavaScript.
- Keep the existing Express architecture and conventions unless a change is required for Prisma.
- Do not put database queries inside controllers.
- Keep the architecture:
  Controller → Service → Repository → Prisma → PostgreSQL
- Services must contain business logic.
- Repositories must contain database access.
- Controllers must handle HTTP concerns only.

## 1. Analyze First

Before changing code, inspect:

- Current MongoDB/Mongoose schemas/models
- All repositories/data-access code
- Services using Mongoose
- Controllers/routes
- Authentication/session storage
- Relationships between entities
- Validation
- Indexes and unique constraints
- Pagination/filter/search/sort logic
- Transactions
- Aggregation queries
- Seed/test data
- Environment variables
- Any MongoDB-specific behavior

Create a migration plan before implementation.

## 2. Design PostgreSQL Schema

Convert the existing MongoDB models into a proper relational PostgreSQL schema.

Use Prisma ORM.

Requirements:

- Use appropriate PostgreSQL types.
- Use UUIDs where appropriate.
- Define primary keys and foreign keys correctly.
- Define required/optional fields correctly.
- Add unique constraints.
- Add indexes for frequently queried fields.
- Model one-to-one, one-to-many, and many-to-many relationships explicitly.
- Preserve existing data meaning.
- Do not blindly convert MongoDB documents into JSON columns.
- Use JSON/JSONB only when the data is genuinely document-like.
- Define cascade/restrict behavior intentionally.
- Preserve timestamps and status fields.

Create/update:

prisma/schema.prisma

## 3. Prisma Setup

Install and configure Prisma for the existing Express backend.

Use:

- @prisma/client
- prisma CLI

Configure:

- DATABASE_URL
- PrismaClient initialization
- development/production-safe Prisma configuration
- migrations
- seed configuration if needed

Create a shared Prisma client instead of creating a new PrismaClient per request.

Example architecture:

src/
db/
prisma.js

Do not instantiate PrismaClient inside controllers or services.

## 4. Replace Mongoose

Remove Mongoose database access and replace it with Prisma.

Convert:

Mongoose Model.find()
→ Prisma findMany()

Model.findById()
→ Prisma findUnique()/findFirst()

Model.findOne()
→ Prisma findFirst()/findUnique()

Model.create()
→ Prisma create()

Model.updateOne()
→ Prisma update()

Model.deleteOne()
→ Prisma delete()

Mongoose populate()
→ Prisma relation includes/selects

Mongoose transactions
→ Prisma transactions

Mongoose aggregation
→ Prisma queries or carefully designed raw SQL when Prisma cannot express the query efficiently.

Do not blindly translate queries. Adapt them to relational database semantics.

## 5. Repository Layer

Create or refactor repositories so all database access goes through repositories.

Example:

src/
modules/
notes/
note.repository.js
note.service.js
note.controller.js

Repository responsibilities:

- Prisma queries
- filtering
- pagination
- sorting
- relations
- transactions when appropriate

Service responsibilities:

- business rules
- authorization decisions
- workflows
- validation orchestration

Controller responsibilities:

- request parsing
- calling services
- response formatting
- HTTP status codes

## 6. Preserve API Contracts

Existing API endpoints should continue working.

Preserve:

- HTTP methods
- routes
- request formats
- response formats
- status codes
- authentication behavior
- authorization behavior
- pagination behavior
- filtering/search behavior

If Prisma naturally changes an internal representation, transform it at the service/API boundary instead of unnecessarily changing the frontend.

## 7. MongoDB → PostgreSQL Data Mapping

For every model, explicitly document:

MongoDB field
→ PostgreSQL field
→ Prisma field
→ PostgreSQL type
→ constraints
→ relationship

Pay special attention to:

- ObjectId → UUID
- embedded documents
- arrays
- references
- populated relationships
- timestamps
- nullable fields
- unique fields
- enums
- indexes

Do not lose relationships or data during migration.

## 8. Database Migration

Create Prisma migrations.

Do not use:

prisma db push

as the production migration strategy.

Use:

prisma migrate dev

for development migrations and:

prisma migrate deploy

for production.

Create seed scripts if the existing project has seed/demo data.

## 9. Search / Filtering / Pagination

Review every existing query.

Preserve behavior for:

- search
- partial matching
- filtering
- sorting
- pagination
- date ranges
- status filtering

Use PostgreSQL-appropriate solutions instead of trying to reproduce MongoDB behavior exactly.

Avoid N+1 queries.

Use Prisma select/include carefully so we do not fetch unnecessary data.

## 10. Transactions

Identify operations that previously required atomic behavior.

Use Prisma transactions where multiple database operations must succeed/fail together.

Example:

prisma.$transaction(...)

Do not add transactions everywhere unnecessarily.

## 11. Authentication / Sessions

If sessions are stored in MongoDB, migrate the session storage to PostgreSQL as well.

Preserve:

- session behavior
- expiration
- cookies
- authentication flow
- logout
- session invalidation
- security properties

Do not replace server-side sessions with JWT unless explicitly required.

## 12. Error Handling

Preserve the existing application error format.

Handle Prisma-specific errors appropriately:

- unique constraint violations
- foreign key violations
- record not found
- invalid queries
- transaction failures

Do not expose raw Prisma/database errors to clients.

Map database errors into the existing AppError/error-handling system.

## 13. Security

Do not expose:

- DATABASE_URL
- database credentials
- Prisma errors containing sensitive information
- internal database structure unnecessarily

Keep secrets in environment variables.

Review:

- authorization
- ownership checks
- validation
- SQL injection risks
- mass assignment
- sensitive fields returned from queries

## 14. Cleanup

After migration:

- Remove Mongoose dependency.
- Remove MongoDB connection code.
- Remove MongoDB environment variables.
- Remove unused MongoDB models.
- Remove unused MongoDB utilities.
- Remove dead repository code.
- Update package.json.
- Update environment documentation.
- Update README/setup instructions.

Do not remove anything until confirming it is no longer referenced.

## 15. Testing

After implementation:

1. Run Prisma validation.
2. Run migrations.
3. Run seed if applicable.
4. Start the backend.
5. Test every migrated repository/service.
6. Test authentication.
7. Test CRUD operations.
8. Test relationships.
9. Test search/filter/pagination.
10. Test error cases.
11. Run existing tests.
12. Fix regressions.

Compare important API responses before and after migration.

## 16. Migration Report

When finished, provide:

### Changed

- files changed
- MongoDB models replaced
- Prisma models created
- repositories migrated
- migrations created

### Database

- PostgreSQL schema summary
- relationships
- indexes
- constraints

### API

- endpoints preserved
- any unavoidable response changes

### Removed

- Mongoose code
- MongoDB dependencies/configuration

### Issues

- anything that could not be migrated exactly
- assumptions made
- manual migration steps required

### Verification

- commands executed
- tests passed
- remaining issues

IMPORTANT:
Work incrementally. Do not modify the entire codebase blindly in one pass.

First analyze the existing code and produce the migration plan.
Then implement the migration feature/module by feature/module.
After each major module, verify that it still works before continuing.

## note

npm install prisma@7 @prisma/client@7 @prisma/adapter-pg pg
npm install -D prisma@7
