# NoteFlow — Product Description

## Purpose

NoteFlow is a **note-taking and knowledge management web application** that enables users to create, organize, and retrieve rich-text notes efficiently. It combines a powerful editor with organizational features to support personal and professional knowledge management.

## Users

| User Category | Needs Addressed |
|---------------|-----------------|
| **Students** | Lecture notes, research organization, study materials |
| **Developers** | Code snippets, technical documentation, debugging notes |
| **Professionals** | Meeting notes, project tracking, reference materials |

## Main Workflows

### 1. Note Creation and Editing
```
1. Click "New Note" button or use ⌘K command palette
2. Enter title and compose content in rich-text editor
3. Add to notebook or tag for organization
4. Auto-save handles persistence (debounced, optimistic updates)
```

### 2. Note Organization
```
1. Create notebooks for broad categorization
2. Apply tags for cross-cutting concerns
3. Pin important notes to top
4. Favorite frequently accessed notes
5. Archive completed/old notes
```

### 3. Search and Retrieval
```
1. Type in global search or open ⌘K
2. Filter by: text, notebook, tag, date range, pinned status
3. Results display inline with content preview
4. Click to open full note
```

### 4. Account Management
```
1. Register with email, name, and secure password
2. Login establishes session via JWT cookie
3. Password reset via email link (1-hour expiry token)
4. Avatar upload to Cloudinary for profile customization
```

## Implemented Capabilities

### Core Features (IMPLEMENTED)

| Feature | Implementation Status | Evidence |
|---------|----------------------|----------|
| User authentication | ✅ Fully implemented | `/auth/*` routes, JWT cookies, bcrypt |
| Rich-text note creation | ✅ Fully implemented | TipTap editor + Note model |
| Note CRUD operations | ✅ Fully implemented | `/notes/*` routes |
| Notebooks (CRUD) | ✅ Fully implemented | `/notebooks/*` routes |
| Tags (CRUD) | ✅ Fully implemented | `/tags/*` routes |
| Pin/Favorite/Archive | ✅ Fully implemented | Toggle endpoints |
| Trash system | ✅ Fully implemented | Soft-delete + restore/purge |
| Full-text search | ✅ Fully implemented | Case-insensitive search on title/content |
| Auto-save | ✅ Fully implemented | `useAutosave` hook |
| Command palette | ✅ Fully implemented | cmdk integration |
| Avatar upload | ✅ Fully implemented | Cloudinary service |
| Password reset | ✅ Fully implemented | Token-based email flow |
| Theme switching | ✅ Fully implemented | next-themes hook |

### UI Components (IMPLEMENTED)

- Responsive layout with collapsible sidebar
- Dark/light theme support
- Toast notifications (sonner)
- Dialogs and dropdowns (Radix UI)
- Mobile-friendly interface

### Editor Features (IMPLEMENTED)

- Tables and table manipulation
- Code blocks with syntax highlighting
- Task lists and task items
- Image embedding
- Link support
- Placeholder text
- Underline formatting

## Limitations

### Current Limitations

| Limitation | Description |
|------------|-------------|
| No real-time collaboration | Notes are personal to each user |
| No version history | Only current note content is stored |
| No offline mode | Requires active internet connection |
| Limited file uploads | Images only via avatar upload (no general file storage) |
| No shared notebooks | Notebooks are user-scoped |
| No markdown export | Only rich-text HTML content |

### Technical Constraints

| Constraint | Impact |
|------------|--------|
| PostgreSQL hosting | Hosted database (e.g. Neon, RDS), no embedded DB |
| Single-user data model | No multi-tenancy or team features |
| Sync-based auto-save | No real-time sync across devices |

## Not Implemented (Future Features Not Claimed)

- Multi-user collaboration
- Markdown export/import
- API access for external integrations
- Mobile native apps
- End-to-end encryption
- Advanced analytics or insights
