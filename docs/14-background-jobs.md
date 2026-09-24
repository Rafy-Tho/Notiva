# NoteFlow — Background Jobs

## Overview

**No background jobs were identified.**

---

## Processing Mode

All operations are **synchronous**:

| Operation | Processing |
|-----------|------------|
| User registration | Sync |
| User login | Sync |
| Note CRUD | Sync |
| Email sending | Sync (Hostinger mail API) |
| Avatar upload | Sync (via Cloudinary API) |

---

## Scheduled Tasks

**None found.**

No cron jobs, scheduled tasks, or queue workers were identified in the codebase.

---

## Queue Systems

**None found.**

No queue libraries (Bull, Agenda, etc.) were found in dependencies.

---

## Async Processing

**None found.**

All API responses are synchronous. Long operations like email sending and image uploads block the request until complete.
