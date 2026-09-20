# Backend Performance & Reliability Audit

Act as a senior backend performance and reliability engineer.

Audit the backend for performance bottlenecks and reliability problems.

Do not optimize blindly. Prefer measurable improvements.

## Performance

Inspect:

- Database queries
- Indexes
- N+1 queries
- Connection pooling
- Network requests
- Serialization
- Memory usage
- CPU-intensive operations
- Large responses
- Pagination
- Caching
- Middleware overhead
- Synchronous/blocking operations

## Database

Identify:

- Missing indexes
- Inefficient queries
- Repeated queries
- N+1 patterns
- Unbounded queries
- Unnecessary columns
- Excessive database connections

Do not add indexes without considering actual query patterns and write overhead.

## Network

Review:

- Unnecessary external requests
- Sequential requests that could safely be parallelized
- Missing timeouts
- Excessive payload sizes
- Duplicate requests

## Memory

Look for:

- Large datasets loaded into memory
- Unbounded caches
- Memory leaks
- Large request bodies
- Unnecessary object duplication

## Reliability

Review:

- Database failures
- External service failures
- Network timeouts
- Retry behavior
- Graceful shutdown
- Startup validation
- Health checks
- Resource limits
- Connection failures

## Timeouts

External calls should not wait indefinitely.

Use appropriate timeouts where missing.

## Retries

Only retry operations where it is safe.

Avoid retry storms.

Use backoff when appropriate.

## Concurrency

Identify race conditions and duplicate operations where relevant.

Ensure operations requiring atomicity use appropriate database transactions or concurrency controls.

## Performance Changes

Before significant optimization:

```text
Measure
  ↓
Identify bottleneck
  ↓
Change
  ↓
Measure again
```

Do not optimize code solely because it "looks slow."

## Verification

Run:

- Tests
- Integration tests
- Relevant benchmarks
- Database query checks
- Startup checks

Compare performance before and after when measurable.

## Final Report

Report:

- Bottlenecks found
- Reliability risks
- Database improvements
- Performance changes
- Measurements where available
- Remaining bottlenecks
- Verification results

**Measure → Diagnose → Optimize → Measure again → Verify → Report.**
