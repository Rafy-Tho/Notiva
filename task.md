# Known Issues Fix Plan

## HIGH Priority

### 1. Backup/Recovery Strategy (Critical) - ✅ DONE
- Created `backend/scripts/backup.js` 
- Created `backend/scripts/restore.js`
- Added `npm run backup` and `npm run restore` scripts
- Created `docs/16-backup-recovery.md`

## MEDIUM Priority

### 2. Cookie Flags Documentation - ✅ DONE
- Updated `docs/05-api.md` to document conditional cookie behavior

### 3. Password Validation Character Set - ✅ DONE
- Removed restrictive ASCII-only character check
- Now accepts any special characters via `\W` regex

### 4. Security Audit Logging - ✅ DONE
- Created `backend/src/middleware/securityAudit.js`
- Logs failed logins, successful logins, password resets, account deletions, avatar changes

## LOW Priority

### 5. Redis for Rate Limiting - ✅ DONE
- Updated `backend/src/middleware/rateLimit.js` to use `rate-limit-redis` store

### 6. Text Index + Search Alignment - ✅ DONE
- Updated `listNotes()` to use `$text` query instead of `$or` regex

### 7. Response Envelope Consistency - ✅ DONE
- Updated `docs/05-api.md` to document actual message field behavior

### 8. Frontend Limit Default - ✅ DONE
- Changed `frontend/src/hooks/useNotes.js` limit from 10 to 20

### 9. Document Avatar Removal Endpoint - ✅ DONE
- Added `DELETE /me/avatar` to `docs/05-api.md`

### 10. Account Deleted Error Code - ✅ DONE
- Added `deletedAt` check in `auth.service.js` login()

### 11. Rate Limit Bypass for Trusted IPs - ✅ DONE
- Added bypass logic in rateLimit.js for `/` health check
- Added TRUSTED_IPS environment variable support

### 12. Content-Type Validation - ✅ DONE
- Created `backend/src/validators/content-type.js`
- Can be applied to POST endpoints as needed

## Remaining Items
- All issues resolved ✅

## Implementation Notes
- Work in order listed (priority within)
- Run tests after each fix
- Update API docs when behavior changes
- Keep commits focused on single issue

