import {
  createBrowserRouter,
  useParams,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicRoute } from "@/features/auth/components/PublicRoute";
import { PrivateRoute } from "@/features/auth/components/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";
import { ErrorOverlay } from "@/components/common/ErrorOverlay";

const Loading = () => <div className="p-4 text-center text-muted-foreground">Loading...</div>;

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const RegistrationVerificationPage = lazy(() => import("@/features/auth/pages/RegistrationVerificationPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const UpdatePasswordPage = lazy(() => import("@/features/auth/pages/UpdatePasswordPage"));
const SettingsPage = lazy(() => import("@/features/auth/pages/SettingsPage"));

const Index = lazy(() => import("@/features/notes/pages/Index"));
const NotesPage = lazy(() => import("@/features/notes/pages/NotesPage"));
const NoteDetailPage = lazy(() => import("@/features/notes/pages/NoteDetailPage"));
const SearchPage = lazy(() => import("@/features/notes/pages/SearchPage"));

function NoteDetailPageWrapper() {
  const { id } = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <NoteDetailPage key={id} />
    </Suspense>
  );
}

function NotebookRoute() {
  const { notebookId } = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <NotesPage title="Notebook" filter={{ notebookId }} />
    </Suspense>
  );
}

function TagRoute() {
  const { tagId } = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <NotesPage title="Tag" filter={{ tagId }} />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <ErrorOverlay />,
    children: [
      { path: "/login", element: <Suspense fallback={<Loading />}><LoginPage /></Suspense> },
      { path: "/register", element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense> },
      { path: "/verify-email", element: <Suspense fallback={<Loading />}><RegistrationVerificationPage /></Suspense> },
      { path: "/forgot-password", element: <Suspense fallback={<Loading />}><ForgotPasswordPage /></Suspense> },
      { path: "/reset-password", element: <Suspense fallback={<Loading />}><ResetPasswordPage /></Suspense> },
      { path: "/update-password", element: <Suspense fallback={<Loading />}><UpdatePasswordPage /></Suspense> },
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
      { index: true, element: <Suspense fallback={<Loading />}><Index /></Suspense> },
      {
        path: "notes",
        element: (
          <Suspense fallback={<Loading />}>
            <NotesPage title="All notes" />
          </Suspense>
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "favorites",
        element: (
          <Suspense fallback={<Loading />}>
            <NotesPage
              title="Favorites"
              filter={{ favorite: true }}
              emptyTitle="No favorites"
              emptyHint="Star a note to find it here"
            />
          </Suspense>
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "archive",
        element: (
          <Suspense fallback={<Loading />}>
            <NotesPage
              title="Archive"
              filter={{ archived: true }}
              emptyTitle="No archived notes"
              emptyHint="Archived notes appear here"
            />
          </Suspense>
        ),
        children: [{ path: ":id", element: <NoteDetailPageWrapper /> }],
      },
      {
        path: "trash",
        element: (
          <Suspense fallback={<Loading />}>
            <NotesPage
              title="Trash"
              filter={{ trashed: true }}
              emptyTitle="Trash is empty"
              emptyHint="Deleted notes appear here for 30 days"
            />
          </Suspense>
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
      { path: "settings", element: <Suspense fallback={<Loading />}><SettingsPage /></Suspense> },
      { path: "search", element: <Suspense fallback={<Loading />}><SearchPage /></Suspense> },
    ],
  },
]);

export { router };
