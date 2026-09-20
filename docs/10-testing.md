# NoteFlow — Testing

## Test Framework

**Vitest** (v5) is used for both frontend and backend testing.

| Aspect | Value |
|--------|-------|
| Framework | Vitest 5 |
| Runner | Vite-native (ESM) |
| DOM Testing | @testing-library/react |
| Mock Environment | jsdom |

---

## Test Files

| File | Type | Location |
|------|------|----------|
| `notes.service.test.js` | Unit test | `backend/src/services/` |
| `useAutosave.test.js` | Unit test | `frontend/src/hooks/` |

---

## Test Coverage Areas

### Backend Tests

**Notes Service (`notes.service.test.js`):**
- CRUD operations (create, read, update, delete)
- Filtering by notebook/tag/date
- Search functionality
- Soft delete and restore
- Ownership validation

### Frontend Tests

**Autosave Hook (`useAutosave.test.js`):**
- Debounce timing
- Optimistic updates
- Conflict resolution
- LocalStorage persistence
- Cleanup on unmount

---

## Running Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## Test Organization

| Category | Files |
|----------|-------|
| **Unit Tests** | Service layer, hooks |
| **Integration Tests** | Not implemented |
| **E2E Tests** | Not implemented |

---

## Known Coverage Gaps

| Area | Status |
|------|--------|
| Authentication flows | UNKNOWN |
| Notebook CRUD | UNKNOWN |
| Tag CRUD | UNKNOWN |
| Upload service | UNKNOWN |
| Email service | UNKNOWN |
| Frontend components | UNKNOWN |
| API endpoints | UNKNOWN |

**Note:** Only the files listed above have been verified. Other areas may have tests that were not discovered during reverse-engineering.
