import {
  createBrowserRouter,
  useParams,
} from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { PublicRoute } from "@/features/auth/components/PublicRoute";
import { PrivateRoute } from "@/features/auth/components/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/features/notes/pages/Index";
import { NotesPage } from "@/features/notes/pages/NotesPage";
import { NoteDetailPage } from "@/features/notes/pages/NoteDetailPage";
import { SearchPage } from "@/features/notes/pages/SearchPage";
import { SettingsPage } from "@/features/auth/pages/SettingsPage";
import { ErrorOverlay } from "@/components/common/ErrorOverlay";

function NoteDetailPageWrapper() {
  const { id } = useParams();
  return <NoteDetailPage key={id} />;
}

function NotebookRoute() {
  const { notebookId } = useParams();
  return <NotesPage title="Notebook" filter={{ notebookId }} />;
}

function TagRoute() {
  const { tagId } = useParams();
  return <NotesPage title="Tag" filter={{ tagId }} />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <ErrorOverlay />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorOverlay />,
    children: [
      { index: true, element: <Index /> },
      {
        path: "notes",
        element: <NotesPage title="All notes" />,
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "favorites",
        element: (
          <NotesPage
            title="Favorites"
            filter={{ favorite: true }}
            emptyTitle="No favorites"
            emptyHint="Star a note to find it here"
          />
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "archive",
        element: (
          <NotesPage
            title="Archive"
            filter={{ archived: true }}
            emptyTitle="No archived notes"
            emptyHint="Archived notes appear here"
          />
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "trash",
        element: (
          <NotesPage
            title="Trash"
            filter={{ trashed: true }}
            emptyTitle="Trash is empty"
            emptyHint="Deleted notes appear here for 30 days"
          />
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "notebooks/:notebookId",
        element: <NotebookRoute />,
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "tags/:tagId",
        element: <TagRoute />,
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      { path: "settings", element: <SettingsPage /> },
      { path: "search", element: <SearchPage /> },
    ],
  },
]);

export { router };
