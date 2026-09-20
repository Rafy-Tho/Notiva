# Theme Switching

## Status

IMPLEMENTED

## Purpose

Toggle between light and dark visual themes.

## Actor

Authenticated users

## Entry Points

- UserSection in Sidebar (theme toggle)

## Preconditions

- User is authenticated

## Input

None (toggle action)

## Validation

None

## Behavior

1. Read current theme from state
2. Toggle to opposite theme
3. Update document class for CSS
4. Persist choice to localStorage

## Frontend

- useTheme hook
- Sidebar UserSection theme toggle

## API

None

## Backend

None

## Database

None

## Authorization

Authenticated users only

## Errors

None

## Side Effects

- CSS theme classes applied
- LocalStorage updated

## Edge Cases

- System preference may be detected initially

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/hooks/useTheme.js
- frontend/src/components/sidebar/UserSection.jsx

Backend:
None

## Unknowns

- Whether theme preference is persisted to backend (not just localStorage)
