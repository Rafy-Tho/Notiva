# NoteFlow — Error Handling

## Error Response Format

All API errors follow this structure:
```json
{
  "success": false,
  "data": null,
  "code": "error_code",
  "message": "Human-readable error message"
}
```

---

## Validation Errors

**Source:** express-validator middleware

**Response:**
```json
{
  "success": false,
  "data": null,
  "code": "validation_error",
  "message": "Validation failed for field(s)"
}
```

**Validation Triggers:**
- Email format invalid
- Password requirements not met
- Name length/character violations
- Required fields missing
- ID format invalid

---

## Authentication Errors

| Code | HTTP Status | Cause |
|------|-------------|-------|
| `unauthorized` | 401 | Missing, expired, or invalid JWT |

**Response:**
```json
{
  "success": false,
  "data": null,
  "code": "unauthorized",
  "message": "Invalid or expired session"
}
```

**Triggers:**
- Invalid JWT signature
- Token expired (>7 days)
- Missing cookie

---

## Authorization Errors

| Code | HTTP Status | Cause |
|------|-------------|-------|
| `forbidden` | 403 | Resource owned by different user |

**Response:**
```json
{
  "success": false,
  "data": null,
  "code": "forbidden",
  "message": "Access denied to this resource"
}
```

---

## API Errors

### Resource Not Found

| Code | HTTP Status |
|------|-------------|
| `not_found` | 404 |

**Response:**
```json
{
  "success": false,
  "data": null,
  "code": "not_found",
  "message": "Resource not found"
}
```

### Resource Conflicts

| Code | HTTP Status | Cause |
|------|-------------|-------|
| `conflict` | 409 | Duplicate resource or stale expectedUpdatedAt |

---

## Database Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `database_error` | 500 | Database operation failed |

**Triggers:**
- PostgreSQL connection failure
- Query execution error
- Unique/foreign-key constraint violation (mapped to 409/400)

---

## Frontend Error Handling

### API Client (`lib/fetchWithAuth.js`)

**Error Handling:**
```javascript
// Response status checks
if (response.status === 401) {
  // Clear session, redirect to login
}

// JSON parsing
try {
  data = await response.json();
} catch {
  // Handle malformed JSON
}
```

### TanStack Query Error Handling

**Mutations:**
```javascript
useMutation({
  mutationFn: updateNote,
  onError: (error) => {
    // Shows toast notification
    // May retry on transient failures
  }
});
```

### Auto-Save Specific

| Error | Behavior |
|-------|----------|
| Network failure | Retry up to 3 times |
| 409 conflict | Show conflict UI, don't retry |
| Permanent failure | Show error toast |

---

## Error Logging

**Server Side:**
```javascript
// Global error handler (app.js)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    code: 'server_error',
    message: 'Internal server error'
  });
});
```

---

## Error Summary

| Category | Error Code | HTTP Status |
|----------|------------|-------------|
| Validation | `validation_error` | 400 |
| Authentication | `unauthorized` | 401 |
| Authorization | `forbidden` | 403 |
| Not Found | `not_found` | 404 |
| Conflict | `conflict` | 409 |
| Server | `server_error` | 500 |
| Database | `database_error` | 500 |
