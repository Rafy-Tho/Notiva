# React Frontend Refactoring — 02: Code Quality & Maintainability

Act as a senior React engineer reviewing the existing frontend for code quality, maintainability, readability, and long-term scalability.

Inspect before modifying anything.

## Review

Check:

- Component size and responsibility
- Component composition
- Props design
- Prop drilling
- Custom hooks
- State management
- Effects
- Event handlers
- Conditional rendering
- Reusable components
- Utility functions
- Duplication
- Naming
- File naming
- Import organization
- Dead code
- Unused variables
- Unused dependencies
- Magic values
- Hardcoded configuration
- Complex expressions
- Complex conditionals
- Business logic inside JSX
- Repeated API logic
- Repeated validation
- Repeated error handling

## React-Specific Checks

Review every `useEffect` for:

- Incorrect dependencies
- Missing dependencies
- Unnecessary dependencies
- Effects doing work that could happen during render
- Effects used for derived state
- Infinite loops
- Duplicate requests
- Cleanup problems
- Race conditions
- State updates after unmount where applicable

Review:

- `useMemo`
- `useCallback`
- `React.memo`
- `useRef`
- `useReducer`
- Context
- Custom hooks

Remove unnecessary optimization as well as missing optimization.

## Maintainability Rules

Prefer:

```text
small responsibility
clear naming
predictable data flow
simple state
explicit dependencies
reusable domain logic
```

Avoid:

```text
giant components
god hooks
god contexts
deep prop drilling
duplicated logic
clever abstractions
unnecessary memoization
business logic inside JSX
```

## Edge Cases

Check:

- `null`
- `undefined`
- empty arrays
- empty strings
- zero values
- false values
- missing props
- invalid user input
- rapid repeated clicks
- double submission
- component unmount during async work
- stale closures
- stale state
- rapid state changes
- unexpected API data
- very long text
- very large lists
- missing images/assets

## Refactoring Rules

- Preserve behavior.
- Avoid unnecessary rewrites.
- Prefer simple solutions.
- Do not create abstractions without repeated or meaningful responsibility.
- Keep components testable.
- Keep feature logic inside its feature where appropriate.
- Keep shared UI generic.

## Verification

Run:

- lint
- tests
- production build
- major user flows

Report all significant changes and remaining issues.
