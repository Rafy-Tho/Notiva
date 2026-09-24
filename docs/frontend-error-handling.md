# Error Handling & Reliability

**Date:** 2026-09-21

## Overview

This document describes the error handling and reliability architecture for the NoteFlow frontend application.

## Error Boundaries

### Global Error Boundary

**Location:** `frontend/src/components/common/ErrorBoundary.jsx`

The `ErrorBoundary` component catches unhandled React rendering errors and provides:
- Fallback UI with error message
- Reload button to recover
- Toast notification to user
- Console logging for debugging

**Usage:** Wrap the root application component:

```jsx
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <Router>
          ...
        </Router>
      </Providers>
    </ErrorBoundary>
  );
}
```

### Route-Level Error Handling

**Location:** `frontend/src/app/routes/index.jsx`

Routes use `errorElement` from React Router 7 to handle routing errors and errors in route components:

```jsx
const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <ErrorOverlay />,
    children: [
      { path: "/login", element: <LoginPage /> },
      ...
    ],
  },
  ...
]);
```

**Location:** `frontend/src/components/common/ErrorOverlay.jsx`

The `ErrorOverlay` component handles:
- 404 errors with specific messaging
- Generic routing errors with error details
- Navigation to home on errors

## TanStack Query Configuration

**Location:** `frontend/src/app/providers.jsx`

The QueryClient is configured with standardized retry and caching behavior:

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
    },
  },
});
```

**Retry Strategy:**
- Up to 3 retries per failed query
- Exponential backoff starting at 1 second
- Maximum delay of 30 seconds between retries
- All queries inherit these defaults

## Query Error Handling

### Notes Page

**Location:** `frontend/src/features/notes/pages/NotesPage.jsx`

```jsx
const { data, isLoading, error, ... } = useNotesInfinite(queryParams);

if (error) {
  return (
    <div className="error-ui">
      <h3>Failed to load notes</h3>
      <p>{error.message}</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}
```

### Note Detail Page

**Location:** `frontend/src/features/notes/pages/NoteDetailPage.jsx`

```jsx
const { data: note, isLoading, error: noteError } = useNote(id);

if (noteError) {
  return (
    <div className="error-ui">
      <h3>Failed to load note</h3>
      <p>{noteError.message}</p>
      <Button onClick={() => navigate("/notes")}>Back to notes</Button>
    </div>
  );
}
```

## API Client Error Handling

**Location:** `frontend/src/lib/fetchWithAuth.js`

The API client provides:
- **401 Handling:** Clears user session, throws "Session expired" error
- **Retry Logic:** Auto-retries on server errors (408, 429, 500-504)
- **Timeout Protection:** 30-second abort timeout
- **Error Parsing:** Extracts error messages from API responses

```javascript
// Example error handling
try {
  const response = await fetchWithAuth(url, options);
} catch (error) {
  // error.status contains HTTP status
  // error.code contains API error code
  // error.message contains human-readable message
  toast.error(error.message);
}
```

## Error Recovery Strategies

| Scenario | Recovery Strategy |
|----------|-------------------|
| **Network failure** | Retry (up to 3x) with backoff |
| **Server error (5xx)** | Retry (up to 3x) with backoff |
| **Session expired (401)** | Clear session, show error toast |
| **Route not found (404)** | Show 404 UI, provide home link |
| **Component render error** | Show ErrorBoundary UI, provide reload |
| **Query failure** | Show inline error with reload/return button |

## Testing Guidelines

### Manual Testing

1. **Network failure:** Disconnect network and navigate to notes
2. **Server error:** Mock 500 response during note loading
3. **Session expiry:** Clear cookies and reload
4. **Invalid route:** Navigate to non-existent path
5. **Component crash:** Force error in component

### Verification Checklist

- [ ] ErrorBoundary catches component crashes
- [ ] 404 routes show error overlay
- [ ] Query errors show inline recovery UI
- [ ] API errors are properly parsed and displayed
- [ ] Session expiry clears state appropriately
- [ ] Toasts show for async errors
- [ ] Loading states persist during errors

## Optimistic Updates with Rollback

Mutations that modify note state now support optimistic updates with automatic rollback on failure. **No `/notes` list or `/notes/counts` refetch happens for these actions** — everything is derived from the cache and mutation responses:

- **Create** - New note is written to `["note", id]` and prepended into every cached list it matches (`insertNoteIntoLists`); sidebar counts incremented. No list refetch.
- **Pin/Unpin** - Immediately updates UI and hoists the pin to the top of default-ordered lists; rolls back on error. Pin has no effect on counts.
- **Favorite/Unfavorite** - Immediately updates UI, list membership and counts; rolls back on error
- **Archive/Unarchive** - Immediately updates UI, list membership and counts; rolls back on error
- **Notebook / Tags** - Immediately updates editor controls, list membership and counts; rolls back on error
- **Title / Content edits** - List cards update instantly (title, `contentPreview` derived from content via `htmlToText(...).slice(0, 50)` mirroring the backend, `wordCount`, `updatedAt` in `onSuccess`) and the edited note hoists to the top of default-ordered lists; full `content` is never stored in list entries
- **Delete** - Immediately transitions the note to `deletedAt` (removed from all-notes/favorites/archive lists, prepended into trash, counts moved to trash); restores on error
- **Restore** - Reverse of delete: removed from trash, back into matching lists, counts restored
- **Purge** - Permanently removes the note from `["note", id]` and every cached list (`removeNoteFromAllLists`); trash count decremented

Optimistic writes update **both** the single-note query (`["note", id]`) and every cached note list in place (`["notes", …]` and `["notes", "infinite", …]`) via `patchNoteInLists` (see `frontend/src/features/notes/lib/noteListCache.js`). Notes are removed from a filtered list when they stop matching its filter (favorites/pinned/notebook/tag/archive/trash) and prepended when they newly match. Pinned notes are hoisted to the top of default-ordered lists. The mutation response is written into the cache on `onSuccess`, keeping `updatedAt` accurate without a network refetch.

Sidebar counts (`useNoteCountsStore`) are updated via pure delta calculations in `frontend/src/lib/noteCounts.js` (`noteCountsDelta`, `notePurgeDelta`) applied with `applyCounts`. **Count deltas are applied only in `onMutate`; re-applying them in `onSuccess` would double-count.** On error, the store is restored from the pre-mutation snapshot with `setState(previousCounts, true)`. Deltas are only applied when the previous note is known from cache (a `previousCounts`/`previousNote` snapshot is always taken). List caches are snapshotted before the mutation and restored on error (`snapshotNotesLists`/`restoreNotesLists`).

**Notebook and tag lists** (`["notebooks"]` / `["tags"]`, cached by `useNotebooks`/`useTags`) use the same no-refetch optimistic pattern in `frontend/src/features/notebooks/hooks/useNotebooks.js` and `frontend/src/features/tags/hooks/useTags.js`:

- **Create** - A placeholder with a client-generated `temp-*` id is inserted into the cached list in `onMutate`; `onSuccess` swaps in the authoritative server object (notebooks are inserted by `name` order, matching the backend sort; tags are appended in server insertion order).
- **Update** - The cached entry is patched in place in `onMutate`; `onSuccess` replaces it with the server response and re-sorts notebooks by name.
- **Delete** - The entry is removed from the cache in `onMutate`; `onSuccess` filters it out (the soft-deleted row never reappears). All three keep a `previousList` snapshot and restore it in `onError`. These updates only run when the list is already cached; otherwise the query refetches on next mount. No `invalidateQueries(["notebooks"])` / `invalidateQueries(["tags"])` refetch happens for these actions.

**Example: useTogglePin**
```jsx
onMutate: async () => {
  await queryClient.cancelQueries({ queryKey: ["note", id] });
  await queryClient.cancelQueries({ queryKey: ["notes"] });
  const previousNote = queryClient.getQueryData(["note", id]);
  const previousLists = snapshotNotesLists(queryClient);
  const previousCounts = snapshotCounts();
  const nextValue = !previousNote?.isPinned;
  queryClient.setQueryData(["note", id], (old) =>
    old ? { ...old, isPinned: nextValue } : old,
  );
  patchNoteInLists(queryClient, id, { isPinned: nextValue });
  return { previousNote, previousLists, previousCounts };
},
onSuccess: (data) => {
  queryClient.setQueryData(["note", id], data);
  patchNoteInLists(queryClient, id, data);
},
onError: (err, _, context) => {
  if (context?.previousNote) {
    queryClient.setQueryData(["note", id], context.previousNote);
  }
  restoreNotesLists(queryClient, context?.previousLists);
  restoreCounts(context?.previousCounts);
},
```

## Server-Side Validation Error Integration

The `useForm` hook now supports server-side error display:

```jsx
const { values, errors, serverErrors, handleSubmit } = useForm(initialValues, schema);
const submit = async (formData) => {
  try {
    await apiCall(formData);
  } catch (error) {
    if (error.code === "VALIDATION_ERROR" && error.errors) {
      setServerErrors(error.errors);
    }
  }
};
```

Server errors appear inline with client validation errors, and the form state is preserved for user correction.

## Remaining Reliability Risks

1. **Slow networks:** No timeout indicators during long requests
2. **Concurrent edits:** Multiple tabs editing same note may conflict
3. **Offline support:** No local-first or offline queue
4. **Network status:** No UI indicator for connectivity issues
