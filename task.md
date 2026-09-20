# Backend Error Handling Audit

Act as a senior backend engineer.

Audit the backend's error-handling architecture.

## Objective

Ensure errors are:

- Correctly caught
- Correctly propagated
- Consistent
- Informative
- Safe
- Debuggable

## Inspect

Review:

- Controllers
- Services
- Repositories
- Middleware
- Async operations
- Database operations
- External API calls
- Global error handlers
- Custom errors
- API error responses

## Check

Identify:

- Swallowed errors
- Empty catch blocks
- Unhandled promises
- Incorrect status codes
- Duplicate error handling
- Leaked stack traces
- Database errors exposed to clients
- Inconsistent error responses
- Generic errors hiding useful information
- Errors logged multiple times
- Errors never logged

## Error Architecture

Prefer a consistent flow:

```text
Repository
    ↓
Service
    ↓
Controller
    ↓
Error Middleware
    ↓
HTTP Response
```

Business code should throw meaningful application errors where appropriate.

The global error handler should convert errors into safe API responses.

## Security

Never expose:

- Stack traces
- SQL queries
- Passwords
- Tokens
- Secrets
- Internal filesystem paths
- Internal infrastructure details

to clients.

## Reliability

Verify failures from:

- Database
- Network
- External services
- Invalid input
- Authentication
- Authorization

are handled appropriately.

## Verification

Test:

- Success
- Validation errors
- Authentication errors
- Authorization errors
- Not found
- Database failures
- Unexpected failures

## Final Report

Report:

- Error-handling problems
- Errors standardized
- Security issues
- Missing handling
- Tests added
- Test results

**Inspect → Trace errors → Standardize → Test → Report.**
