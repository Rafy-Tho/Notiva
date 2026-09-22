# Backup & Recovery Strategy

## Overview

NoteFlow implements automated backup procedures to protect user data. Backups are stored as JSON files and can be used for disaster recovery.

## Backup Types

### 1. Manual Backup

Create a one-time backup:

```bash
cd backend
npm run backup
```

**Output:** JSON file in `backend/backups/` directory

### 2. Scheduled Backup (Production)

Add to system crontab (Linux/Mac):
```
0 2 * * * cd /path/to/noteflow/backend && npm run backup >> /var/log/noteflow-backup.log 2>&1
```

Or use Windows Task Scheduler for Windows environments.

## Backup File Structure

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "database": "postgresql",
  "tables": {
    "User": [...],
    "Notebook": [...],
    "Tag": [...],
    "Note": [...],
    "NoteTag": [...]
  }
}
```

## Recovery Process

### 1. Stop the Application

Ensure no writes are happening during recovery.

### 2. Restore from Backup

```bash
cd backend
npm run restore -- backup/backups/backup-2025-01-15T10-30-00-000Z.json
```

### 3. Verify Data

Check that users and notes are accessible after restoration.

## PostgreSQL Hosted Backups

If using a managed PostgreSQL provider (Neon, RDS, Supabase, etc.):

1. Enable automated backups / point-in-time recovery in the provider dashboard
2. Schedule regular snapshots (recommended: daily)
3. Use `pg_dump` for a logical backup of the `public` schema if needed

## Best Practices

| Practice | Frequency | Notes |
|----------|-----------|-------|
| Manual backup | Before major changes | Create before schema migrations |
| Automated backup | Daily | At low-traffic hours |
| Backup verification | Weekly | Test restore on separate DB |
| Offsite storage | Daily | Copy to cloud storage (S3, etc.) |

## Recovery Time Objective (RTO)

| Scenario | Estimated RTO |
|----------|---------------|
| Single file restore | 5-10 minutes |
| Full database restore | 15-30 minutes |

## Notes

- Backups include soft-deleted rows (restore is a full table replace)
- Restore overwrites existing data
- Always verify backup integrity before using for recovery
- Store backup files separately from application servers
