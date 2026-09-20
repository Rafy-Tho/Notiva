# React Frontend Refactoring — 01: Architecture & Folder Structure

You are a senior React engineer performing an architecture and folder-structure audit of an existing React frontend.

Your goal is to understand the existing application first, then improve its architecture without unnecessarily rewriting working code.

## Objectives

Inspect and evaluate:

- Overall frontend architecture
- `src/` folder structure
- Feature/module boundaries
- Component organization
- Page/route organization
- Hooks
- API/client layer
- State management
- Context/providers
- Utilities
- Shared components
- Forms
- Authentication flow
- Routing
- Styling
- Assets
- Configuration
- Error boundaries
- Test organization

Determine whether responsibilities are clearly separated and whether the current structure will remain maintainable as the application grows.

## Preferred Architecture

Use this as a guideline, not a requirement:

```text
frontend/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── providers.jsx
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── validation/
│   │   │   └── index.js
│   │   │
│   │   ├── notes/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── index.js
│   │   │
│   │   └── notebooks/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       └── services/
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── utils/
│   ├── styles/
│   └── main.jsx
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
├── package.json
└── README.md
```

Do not create every directory just because it appears in this example.

Only introduce a layer when it represents a real responsibility.

## React Architecture Rules

Prefer:

```text
Page
 ↓
Feature Component
 ↓
Custom Hook
 ↓
Service/API
 ↓
Backend
```

For UI-only state:

```text
Component
 ↓
useState / useReducer
```

For shared application state:

```text
Component
 ↓
Hook / Context / State Store
 ↓
State
```

Avoid:

```text
Component → direct database
Component → scattered fetch calls everywhere
Component → large business logic
UI component → authentication implementation details
Shared component → feature-specific logic
```

## Inspect Before Changing

First inspect:

- Existing folders
- Existing imports
- Component dependencies
- Routes
- API calls
- State management
- Context providers
- Custom hooks
- Shared components
- Feature boundaries
- Circular dependencies
- Duplicate functionality
- Large components
- Components with multiple unrelated responsibilities

Build a dependency map before refactoring.

## Edge Cases

Check for:

- Components rendered outside expected providers
- Missing context values
- Missing route parameters
- Invalid route parameters
- Direct navigation to protected pages
- Browser refresh on nested routes
- Deep links
- Components receiving `null` or `undefined`
- Empty API responses
- Failed API requests
- Components mounted/unmounted during async operations
- Duplicate API requests
- Stale state
- Circular imports
- Feature modules importing unrelated features directly
- Shared components depending on feature-specific code
- Environment variables missing in production
- Development-only code accidentally included in production
- Incorrect path aliases
- Case-sensitive import problems
- Browser-specific assumptions
- SSR/prerendering compatibility if applicable

## Refactoring Rules

- Do not blindly move files.
- Do not rewrite the entire application.
- Do not introduce unnecessary abstractions.
- Do not create components that are used only once unless they improve clarity.
- Do not split components purely because they are large; identify actual responsibilities first.
- Preserve existing behavior.
- Preserve public routes and API contracts.
- Avoid unrelated feature changes.
- Avoid circular dependencies.
- Prefer feature ownership over arbitrary technical folders.
- Keep shared code genuinely reusable.

## Verification

After changes:

- Run the application.
- Run lint.
- Run tests.
- Verify imports.
- Verify routes.
- Verify authentication flow.
- Verify major user flows.
- Check browser console errors.
- Check network requests.
- Check for circular dependencies.
- Check production build.

## Final Report

Report:

1. Existing architecture
2. Problems discovered
3. Changes made
4. Files moved/created/deleted
5. Architecture decisions
6. Edge cases addressed
7. Remaining technical debt
8. Verification results
9. Any behavior that intentionally changed

Do not continue to unrelated refactoring tasks.
