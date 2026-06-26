import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
} from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { PublicRoute } from "./components/PublicRoute";
import { Toaster as Sonner } from "./components/ui/sonner";
import { LoginPage } from "./pages/auth/LoginPage";
import Index from "./pages/Index";
import { NoteDetailPage } from "./pages/NoteDetailPage";
import { NotesPage } from "./pages/NotesPage";
import { useAuthStore } from "./store/authStore";
import { SettingsPage } from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
const queryClient = new QueryClient();

function Bootstrap({ children }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

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
    children: [
      { index: true, element: <Index /> },
      {
        path: "notes",
        element: <NotesPage title="All notes" />,
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
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
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
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
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
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
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
      },
      {
        path: "notebooks/:notebookId",
        element: <NotebookRoute />,
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
      },
      {
        path: "tags/:tagId",
        element: <TagRoute />,
        children: [
          { path: ":id", element: <NoteDetailPageWrapper /> },
        ],
      },
      { path: "settings", element: <SettingsPage /> },
      { path: "search", element: <SearchPage /> },
    ],
  },
]);

function App() {
  return (
    <Bootstrap>
      <QueryClientProvider client={queryClient}>
        <Sonner position="top-right" />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Bootstrap>
  );
}

export default App;
