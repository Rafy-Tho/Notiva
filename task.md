# React Frontend Refactoring — 06: Performance & Scalability

Act as a senior React performance engineer.

Inspect the existing application before optimizing.

Do not optimize based on assumptions. Identify measurable or structurally obvious bottlenecks first.

## React Rendering

Check:

- unnecessary re-renders
- unstable props
- unnecessary context updates
- large component trees
- expensive calculations
- unnecessary state updates
- incorrect dependency arrays
- excessive effects
- expensive rendering inside lists

Review:

- `React.memo`
- `useMemo`
- `useCallback`

Use them only when they solve an actual rendering or computation problem.

## Network Performance

Check:

- duplicate requests
- sequential requests that could be parallel
- unnecessary requests
- request waterfalls
- missing caching
- excessive polling
- large responses
- unnecessary refetching
- request cancellation

## Bundle Performance

Check:

- bundle size
- unused dependencies
- large dependencies
- code splitting
- lazy routes
- dynamic imports
- unnecessary libraries
- large assets

## Rendering Large Data

Check:

- long note lists
- large search results
- large tables/lists
- rich-text content
- images
- expensive filtering/sorting

Consider virtualization when genuinely necessary.

## User Experience

Check:

- initial page load
- loading states
- perceived performance
- slow network
- mobile performance
- interaction latency
- typing performance
- autosave performance

For autosave specifically check:

- debounce
- duplicate saves
- save race conditions
- stale saves overwriting newer data
- failed saves
- retry behavior
- navigation during save

## Edge Cases

Test:

- 0 records
- 1 record
- hundreds/thousands of records
- very large note
- rapid typing
- rapid navigation
- slow network
- offline mode
- repeated actions
- multiple simultaneous requests
- low-end device behavior where measurable

## Rules

Do not:

- add memoization everywhere
- add caching without invalidation strategy
- introduce complexity for negligible gains
- sacrifice correctness for speed

Every optimization should have a reason.

## Verification

Compare before/after where practical.

Report:

- bottleneck
- root cause
- optimization
- expected impact
- tradeoffs
- verification
