# Backend API Design Audit

Act as a senior API/backend engineer.

Audit the existing API for consistency, correctness, usability, security boundaries, and REST/API design quality.

## Inspect

Inventory all endpoints:

```text
METHOD
PATH
AUTHENTICATION
AUTHORIZATION
REQUEST
RESPONSE
STATUS CODES
ERRORS
```

Check route consistency across the entire backend.

## Review

Evaluate:

- Resource naming
- HTTP methods
- URL structure
- Status codes
- Request validation
- Response consistency
- Error format
- Pagination
- Filtering
- Sorting
- Search
- Authentication
- Authorization
- Rate limiting
- CORS
- API versioning
- Idempotency where applicable

Prefer predictable resource-oriented endpoints.

## Consistency

Identify inconsistent patterns such as:

```text
/users/:id
/user/:id
/users?id=
```

or inconsistent responses:

```json
{ "data": {} }
```

versus:

```json
{ "user": {} }
```

Do not change public contracts without checking existing clients and documenting the change.

## Validation

Verify validation for:

- Body
- Query parameters
- Path parameters
- Relevant headers

Never rely solely on frontend validation.

## Errors

Ensure API errors:

- Use appropriate HTTP status codes.
- Have consistent structure.
- Do not expose internal implementation details.
- Provide useful client-facing messages.

## Security Boundary

Verify that protected resources correctly enforce:

- Authentication
- Authorization
- Resource ownership

Check for IDOR/BOLA risks.

## Performance

Review:

- Pagination
- Response size
- N+1 API behavior
- Excessive requests
- Expensive endpoints

## Verification

Run API/integration tests.

Test both successful and failure scenarios.

## Final Report

Provide:

- Endpoint issues
- Naming inconsistencies
- Status-code issues
- Validation issues
- Response inconsistencies
- Authorization issues
- Compatibility risks
- Changes made
- Tests performed

Do not redesign the entire API unnecessarily.

**Inspect → Document → Fix → Test → Report.**
