import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLayoutEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { PublicRoute } from "./components/PublicRroute";
import { Toaster as Sonner } from "./components/ui/sonner";
import { LoginPage } from "./pages/auth/LoginPage";
import Index from "./pages/Index";
import { NoteDetailPage } from "./pages/NoteDetailPage";
import { NotesPage } from "./pages/NotesPage";
import { registerSessionExpiredHandler, useAuthStore } from "./store/authStore";
import { SettingsPage } from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
const queryClient = new QueryClient();

function Bootstrap({ children }) {
  const navigate = useNavigate();
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const sessionRestored = useAuthStore((state) => state.sessionRestored);

  useLayoutEffect(() => {
    // Tell the store where to send the user when refresh fails
    registerSessionExpiredHandler(() => navigate("/login", { replace: true }));
    restoreSession();
  }, []);

  if (!sessionRestored) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }
  return <>{children}</>;
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Sonner position="top-right" />
      <BrowserRouter>
        <Bootstrap>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
            <Route
              element={
                <PrivateRoute>
                  <AppLayout></AppLayout>
                </PrivateRoute>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/notes" element={<NotesPage title="All notes" />}>
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route
                path="/favorites"
                element={
                  <NotesPage
                    title="Favorites"
                    filter={{ favorite: true }}
                    emptyTitle="No favorites"
                    emptyHint="Star a note to find it here"
                  />
                }
              >
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route
                path="/archive"
                element={
                  <NotesPage
                    title="Archive"
                    filter={{ archived: true }}
                    emptyTitle="No archived notes"
                    emptyHint="Archived notes appear here"
                  />
                }
              >
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route
                path="/trash"
                element={
                  <NotesPage
                    title="Trash"
                    filter={{ trashed: true }}
                    emptyTitle="Trash is empty"
                    emptyHint="Deleted notes appear here for 30 days"
                  />
                }
              >
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route path="/notebooks/:notebookId" element={<NotebookRoute />}>
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route path="/tags/:tagId" element={<TagRoute />}>
                <Route path=":id" element={<NoteDetailPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
          </Routes>
        </Bootstrap>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
function NotebookRoute() {
  const { notebookId } = useParams();
  return <NotesPage title="Notebook" filter={{ notebookId }} />;
}
function TagRoute() {
  const { tagId } = useParams();
  return <NotesPage title="Tag" filter={{ tagId }} />;
}
export default App;
