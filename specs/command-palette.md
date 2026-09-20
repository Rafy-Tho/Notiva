# Command Palette

## Status

IMPLEMENTED

## Purpose

Quick navigation and search via keyboard.

## Actor

Authenticated users

## Entry Points

- ⌘K/Ctrl+K keyboard shortcut

## Preconditions

- User is authenticated

## Input

- User text input

## Validation

- None

## Behavior

1. Open command palette overlay
2. Show navigation commands and search input
3. Filter commands as user types
4. Select and execute command via keyboard

## Frontend

- CommandPalette component (cmdk-based)
- useUIStore (open/close state)
- Global keyboard event listener

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

- Palette open/close state managed
- Navigates to selected page

## Edge Cases

- Opens regardless of current page
- Esc key closes palette

## Tests

Not found in test suite

## Source Evidence

Frontend:
- frontend/src/components/ui/CommandPalette.jsx
- frontend/src/hooks/useKeyboardShortcut.js
- frontend/src/store/uiStore.js

Backend:
None

## Unknowns

- List of available commands
