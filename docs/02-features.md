# NoteFlow — Feature Inventory

## User Management Features

### User Registration
| Attribute | Value |
|-----------|-------|
| **Purpose** | Create new user accounts |
| **User** | Public (unauthenticated) |
| **Entry Point** | `/register` route, AppHeader |
| **Frontend** | RegisterPage component |
| **Backend** | `POST /api/v1/auth/register` |
| **Database** | Creates User document |
| **Status** | IMPLEMENTED |

### User Login
| Attribute | Value |
|-----------|-------|
| **Purpose** | Authenticate existing users |
| **User** | Public (unauthenticated) |
| **Entry Point** | `/login` route, AppHeader |
| **Frontend** | LoginPage component |
| **Backend** | `POST /api/v1/auth/login` |
| **Database** | Reads User document |
| **Status** | IMPLEMENTED |

### User Logout
| Attribute | Value |
|-----------|-------|
| **Purpose** | Clear session |
| **User** | Authenticated |
| **Entry Point** | UserSection in Sidebar |
| **Frontend** | authStore.logout() |
| **Backend** | `POST /api/v1/auth/logout` |
| **Database** | None |
| **Status** | IMPLEMENTED |

### Password Reset
| Attribute | Value |
|-----------|-------|
| **Purpose** | Recover account access |
| **User** | Public (unauthenticated) |
| **Entry Point** | `/forgot-password` route |
| **Frontend** | ForgotPasswordPage, ResetPasswordPage |
| **Backend** | `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password` |
| **Database** | Updates User with resetToken |
| **External** | Brevo (email delivery) |
| **Status** | IMPLEMENTED |

---

## Note Features

### Note Creation
| Attribute | Value |
|-----------|-------|
| **Purpose** | Create new notes |
| **User** | Authenticated |
| **Entry Point** | "New Note" button, ⌘K |
| **Frontend** | NotesPage, useNotes.create mutation |
| **Backend** | `POST /api/v1/notes` |
| **Database** | Creates Note document |
| **Status** | IMPLEMENTED |

### Note Editing
| Attribute | Value |
|-----------|-------|
| **Purpose** | Update existing notes |
| **User** | Authenticated |
| **Entry Point** | NoteDetailPage |
| **Frontend** | useAutosave hook |
| **Backend** | `PATCH /api/v1/notes/:id` |
| **Database** | Updates Note document |
| **Status** | IMPLEMENTED |

### Note Deletion
| Attribute | Value |
|-----------|-------|
| **Purpose** | Remove notes |
| **User** | Authenticated |
| **Entry Point** | Note actions menu |
| **Frontend** | useNotes.delete mutation |
| **Backend** | `DELETE /api/v1/notes/:id` (soft), `POST /notes/:id/purge` (permanent) |
| **Database** | Sets/ clears deletedAt |
| **Status** | IMPLEMENTED |

### Note Organization (Pin/Favorite/Archive)
| Attribute | Value |
|-----------|-------|
| **Purpose** | Priority and filtering |
| **User** | Authenticated |
| **Entry Point** | Note actions menu |
| **Frontend** | Note actions (togglePin/toggleFavorite/toggleArchive) |
| **Backend** | `POST /api/v1/notes/:id/{pin,favorite,archive}` |
| **Database** | Updates Note flags |
| **Status** | IMPLEMENTED |

### Trash System
| Attribute | Value |
|-----------|-------|
| **Purpose** | Recover deleted notes |
| **User** | Authenticated |
| **Entry Point** | Sidebar → Trash |
| **Frontend** | NotesPage (trashed filter) |
| **Backend** | `GET /api/v1/notes/trash`, `POST /api/v1/notes/:id/restore` |
| **Database** | Filtered by deletedAt |
| **Status** | IMPLEMENTED |

### Search
| Attribute | Value |
|-----------|-------|
| **Purpose** | Find notes |
| **User** | Authenticated |
| **Entry Point** | Search icon, ⌘K |
| **Frontend** | SearchPage component |
| **Backend** | `GET /api/v1/notes` with search param |
| **Database** | MongoDB text indexes |
| **Status** | IMPLEMENTED |

---

## Notebook Features

### Notebook Management
| Attribute | Value |
|-----------|-------|
| **Purpose** | Organize notes into folders |
| **User** | Authenticated |
| **Entry Point** | Sidebar → Notebooks section |
| **Frontend** | NotebookRow, useNotebooks hooks |
| **Backend** | `/api/v1/notebooks/*` routes |
| **Database** | Notebook model |
| **Status** | IMPLEMENTED |

---

## Tag Features

### Tag Management
| Attribute | Value |
|-----------|-------|
| **Purpose** | Cross-cutting note organization |
| **User** | Authenticated |
| **Entry Point** | Sidebar → Tags section |
| **Frontend** | TagRow, useTags hooks |
| **Backend** | `/api/v1/tags/*` routes |
| **Database** | Tag model |
| **Status** | IMPLEMENTED |

---

## Profile Features

### Avatar Upload
| Attribute | Value |
|-----------|-------|
| **Purpose** | Profile customization |
| **User** | Authenticated |
| **Entry Point** | UserSection in Sidebar |
| **Frontend** | SettingsPage |
| **Backend** | `POST /api/v1/me/avatar` |
| **Database** | Updates User.avatar |
| **External** | Cloudinary (image hosting) |
| **Status** | IMPLEMENTED |

### Profile Management
| Attribute | Value |
|-----------|-------|
| **Purpose** | Update user info |
| **User** | Authenticated |
| **Entry Point** | Settings page |
| **Frontend** | SettingsPage |
| **Backend** | `GET/PATCH /api/v1/me`, `POST /api/v1/me/password` |
| **Database** | Updates User |
| **Status** | IMPLEMENTED |

---

## UI Features

### Command Palette
| Attribute | Value |
|-----------|-------|
| **Purpose** | Quick navigation |
| **User** | Authenticated |
| **Entry Point** | ⌘K or Ctrl+K |
| **Frontend** | cmdk-based component |
| **Backend** | None |
| **Status** | IMPLEMENTED |

### Theme Switching
| Attribute | Value |
|-----------|-------|
| **Purpose** | Visual preference |
| **User** | Authenticated |
| **Entry Point** | UserSection in Sidebar |
| **Frontend** | useTheme hook |
| **Backend** | None |
| **Status** | IMPLEMENTED |

---

## Feature Status Summary

| Status | Count |
|--------|-------|
| IMPLEMENTED | 16 |
| PARTIALLY IMPLEMENTED | 0 |
| UNKNOWN | 0 |
