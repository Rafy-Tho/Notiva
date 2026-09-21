# React Frontend Refactoring — 03: API, State & Data Handling

Act as a senior React engineer auditing API communication, client-side state, forms, caching, and data handling.

Inspect the existing implementation before changing it.

## API Review

Check:

- API client architecture
- Centralized HTTP configuration
- Base URL handling
- Authentication credentials
- Request headers
- Response parsing
- Error handling
- Request cancellation
- Timeout behavior
- Retry behavior
- Duplicate requests
- API response validation
- API versioning
- Consistent API types/shapes
- Environment configuration

Avoid scattering raw API calls across components.

Prefer:

```text
Component
   ↓
Hook
   ↓
Service/API client
   ↓
Backend
```

## State Review

Identify:

- Local UI state
- Server state
- Global application state
- Derived state
- Form state
- URL state

Do not put everything into global state.

Check for:

- duplicated state
- stale state
- unnecessary global state
- derived state stored unnecessarily
- state synchronization problems
- cache invalidation problems

## Loading States

Every asynchronous operation should have an appropriate state where necessary:

```text
idle
loading
success
error
```

Check:

- initial loading
- refetching
- submitting
- saving
- deleting
- background updates

## Data Edge Cases

Handle:

- `null`
- `undefined`
- empty response
- empty list
- malformed response
- missing fields
- unexpected fields
- expired authentication
- unauthorized response
- forbidden response
- not found
- validation errors
- server errors
- network failure
- timeout
- offline browser
- slow network
- duplicate submission
- request cancellation
- stale response arriving after a newer request
- pagination boundaries
- deleted item that is still visible in UI

## Forms

Check:

- validation
- server validation errors
- required fields
- whitespace-only input
- maximum lengths
- invalid formats
- duplicate submission
- disabled submit state
- reset behavior
- dirty state
- unsaved changes
- keyboard submission
- accessibility

## Refactoring Rules

- Preserve backend contracts.
- Do not silently change request/response formats.
- Centralize repeated API behavior.
- Keep server state separate from UI state where appropriate.
- Avoid unnecessary client-side duplication of backend truth.

## Verification

Test:

- successful request
- failed request
- timeout
- unauthorized request
- empty result
- malformed result
- rapid repeated requests
- cancellation
- refresh
- retry
- form submission
- delete/update/create flows
