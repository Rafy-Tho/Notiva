# Frontend Components

## Pages

### `/` (IndexPage)
Redirects to `/notes`

### `/login`
PublicRoute → LoginPage (authStore.login)

### `/register`
PublicRoute → RegisterPage (authStore.register)

### `/forgot-password`
PublicRoute → ForgotPasswordPage

### `/reset-password`
PublicRoute → ResetPasswordPage

### `/notes`
PrivateRoute → NotesPage (all notes list)
- Nested: `/:id` → NoteDetailPageWrapper

### `/favorites`
PrivateRoute → NotesPage (filtered: isFavorite=true)

### `/archive`
PrivateRoute → NotesPage (filtered: isArchived=true)

### `/trash`
PrivateRoute → NotesPage (filtered: trashed=true)

### `/notebooks/:notebookId`
PrivateRoute → NotesPage (filtered: notebookId)
- Nested: `/:id` → NoteDetailPageWrapper

### `/tags/:tagId`
PrivateRoute → NotesPage (filtered: tagId)
- Nested: `/:id` → NoteDetailPageWrapper

### `/settings`
PrivateRoute → SettingsPage

### `/search`
PrivateRoute → SearchPage

---

## Layout Components

### AppLayout
Root layout for authenticated users
- Sidebar
- AppHeader
- Outlet (page content)
- CommandPalette

### Sidebar
Collapsible sidebar with:
- ActionButtons (New note, Search)
- NavSections (All, Favorites, Archive, Trash)
- NotebooksSection → NotebookRow ×N
- TagsSection → TagRow ×12 max
- UserSection

### AppHeader
- Sidebar toggle
- Logo
- Search
- New note button
- User avatar

---

## Editor Components

### NoteEditor
TipTap editor with:
- starter-kit
- code-block-lowlight
- image
- link
- placeholder
- table, table-cell, table-header, table-row
- task-item, task-list
- underline

### EditorToolbar
Toolbar buttons for editor commands

---

## UI Components

### ui/sonner
Toast notifications via sonner library

---

## Components

### layout/
- AppHeader
- AppLayout
- Sidebar

### note/
Note-specific components

### search/
Search-related components

### sidebars/
Sidebar-related components

### ui/
Shared UI components

---

## Hooks

### useAuth
Auth store hook

### useMe
Fetches current user

### useNotes
Note CRUD operations

### useNotebooks
Notebook CRUD operations

### useTags
Tag CRUD operations

### useAutosave
Debounced auto-save with optimistic updates

### useTheme
Theme switching (dark/light)

### useMobile
Mobile detection hook

---

## Store

### authStore
Zustand store for:
- user
- isLoading
- error
- isAuthenticated
- setUser, register, login, logout, restoreSession, delete

### useUIStore
Persisted UI settings:
- theme
- font size
- sidebar state

### useNoteCountsStore
Caches note counts

---

## API Client

### lib/fetchWithAuth
Helper function that:
- Adds credentials: "include" for cookies
- Handles auth headers
- Returns JSON data

---

## Routes (React Router)

Public Routes:
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Private Routes (require Auth):
- `/notes`
- `/notes/:id`
- `/favorites`
- `/favorites/:id`
- `/archive`
- `/archive/:id`
- `/trash`
- `/trash/:id`
- `/notebooks/:notebookId`
- `/notebooks/:notebookId/:id`
- `/tags/:tagId`
- `/tags/:tagId/:id`
- `/settings`
- `/search`

---

## State Management

- **Zustand:** authStore, useUIStore (localStorage persisted)
- **TanStack Query:** Server state caching, mutation invalidation

---

## Unknowns

| Component | Status |
|-----------|--------|
| Note detail page | CONFIRMED - NoteDetailPage component exists |
| Command palette | CONFIRMED - referenced in App.jsx |
| Settings page | CONFIRMED - SettingsPage component exists |
