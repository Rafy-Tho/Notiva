# ai/feature-map.md

Feature Map
===========

| Feature       | Frontend                              | Backend                  | Database              | Spec              |
| ------------- | ------------------------------------- | ------------------------ | --------------------- | ----------------- |
| Registration  | frontend/pages/Auth.jsx (Signup)      | controllers/auth.js      | User                  | specs/auth/       |
| Login         | frontend/pages/Auth.jsx (Login)       | controllers/auth.js      | User                  | specs/auth/       |
| Logout        | frontend/components/Layout.jsx        | controllers/auth.js      | -                     | specs/auth/       |
| Verify Session| frontend/App.jsx (useEffect)          | controllers/auth.js      | User                  | specs/auth/       |
| Profile View  | frontend/pages/SettingsPage.jsx       | controllers/me.js        | User                  | specs/profile/    |
| Profile Edit  | frontend/pages/SettingsPage.jsx       | controllers/me.js        | User                  | specs/profile/    |
| Avatar Upload | frontend/pages/SettingsPage.jsx       | controllers/me.js, upload| User                  | specs/profile/    |
| Change Password| frontend/pages/SettingsPage.jsx      | controllers/me.js        | User                  | specs/profile/    |
| Password Reset| frontend/pages/Auth.jsx (Reset)       | controllers/auth.js      | User                  | specs/auth/       |
| List Notes    | frontend/pages/NotesPage.jsx          | controllers/notes.js     | Note                  | specs/notes/      |
| Create Note   | frontend/components/note/NewNote.jsx  | controllers/notes.js     | Note                  | specs/notes/      |
| Edit Note     | frontend/pages/NoteDetailPage.jsx     | controllers/notes.js     | Note                  | specs/notes/      |
| Delete Note   | frontend/components/note/NoteCard.jsx | controllers/notes.js     | Note                  | specs/notes/      |
| Pin Note      | frontend/components/note/NoteCard.jsx | controllers/notes.js     | Note                  | specs/notes/      |
| Favorite Note | frontend/components/note/NoteCard.jsx | controllers/notes.js     | Note                  | specs/notes/      |
| Archive Note  | frontend/components/note/NoteCard.jsx | controllers/notes.js     | Note                  | specs/notes/      |
| Restore Note  | frontend/pages/NotesPage.jsx          | controllers/notes.js     | Note                  | specs/notes/      |
| View Trash    | frontend/components/sidebars/TrashSidebar.jsx | controllers/notes.js | Note          | specs/notes/      |
| List Notebooks| frontend/components/sidebars/NotebookSidebar.jsx | controllers/notebooks.js | Notebook      | specs/notebooks/  |
| Create Notebook| frontend/components/sidebars/NotebookSidebar.jsx | controllers/notebooks.js | Notebook      | specs/notebooks/  |
| Edit Notebook | frontend/components/sidebars/NotebookSidebar.jsx | controllers/notebooks.js | Notebook      | specs/notebooks/  |
| Delete Notebook| frontend/components/sidebars/NotebookSidebar.jsx | controllers/notebooks.js | Notebook      | specs/notebooks/  |
| List Tags     | frontend/components/sidebars/TagSidebar.jsx | controllers/tags.js     | Tag             | specs/tags/       |
| Create Tag    | frontend/components/sidebars/TagSidebar.jsx | controllers/tags.js     | Tag             | specs/tags/       |
| Edit Tag      | frontend/components/sidebars/TagSidebar.jsx | controllers/tags.js     | Tag             | specs/tags/       |
| Delete Tag    | frontend/components/sidebars/TagSidebar.jsx | controllers/tags.js     | Tag             | specs/tags/       |
| Search        | frontend/pages/SearchPage.jsx         | controllers/notes.js     | Note (text index)     | specs/notes/      |

Notes
-----
- Search filters: search, dateFilter, notebookId, tagId, isArchived, isFavorite, isPinned, trashed
- All endpoints require authentication except register, login, verify-email, resend-verification, reset-password-code, confirm-password-reset, and logout
- Optimistic updates implemented via TanStack Query
- Conflict detection returns 409 on stale updatedAt
