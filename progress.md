# Project Progress

## Current Status

The application is implemented and currently in maintenance/development.

Last analyzed: 2026-09-20

## Completed

- User Registration
- User Login
- User Logout
- Password Reset
- Note Creation
- Note Editing
- Note Deletion (soft delete and permanent purge)
- Note Organization (notebooks, tags, pin, favorite, archive)
- Note Search
- Note Trash System (30-day retention)
- Notebook Management
- Tag Management
- Avatar Upload
- Profile Management
- Password Change
- Command Palette
- Theme Switching

## In Progress

No active development work was identified from the repository.

## Planned

No documented future work was identified.

## Known Issues

12 known issues documented in `docs/15-known-issues.md`:

| Severity | Issue |
|----------|-------|
| HIGH | No documented backup/recovery strategy |
| MEDIUM | Cookie secure/sameSite flags are environment-dependent |
| MEDIUM | Password validation uses restricted character set |
| MEDIUM | No audit logging for security events |
| LOW | Rate limiting uses memory instead of Redis |
| LOW | Text indexes defined but regex search used |
| LOW | Response envelope returns strings instead of null |
| LOW | Frontend default limit is 10, docs say 20 |
| LOW | Avatar removal endpoint not documented |
| LOW | No explicit error code for account already deleted |
| LOW | No rate limit bypass for trusted IPs |
| LOW | Missing Content-Type validation for JSON endpoints |

See `docs/15-known-issues.md` for full details.

## Technical Debt

- Rate limiting configured with Redis packages but using memory-only storage
- Search uses regex queries despite text indexes being defined
- API documentation and implementation mismatch on response envelope format
- Missing security audit logging for login failures, password resets, and account deletions
- No backup or data recovery automation
- No session invalidation on logout (JWT not blacklisted)

See `decisions/unresolved-questions.md` for additional unknowns that may represent technical debt.

## Recent Changes

Repository history was not available for verification.

## Next Steps

1. **Backup Strategy** (HIGH priority): Implement and document database backup/recovery process
2. **Audit Logging** (MEDIUM priority): Add logging for security-relevant events
3. **Search Optimization** (LOW priority): Migrate from regex to text index-based search
4. **Redis Integration** (LOW priority): Configure Redis-backed rate limiting for horizontal scaling
5. **Documentation** (LOW priority): Add missing documentation (avatar removal endpoint, API response format)

## Living Document Rule

This document should be updated whenever:
- New features are implemented
- Features are completed or changed
- Known issues are resolved or new ones are discovered
- Technical debt is addressed
- Planned work is identified or completed
