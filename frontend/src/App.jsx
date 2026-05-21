import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { registerSessionExpiredHandler, useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { LoginPage } from "./pages/auth/LoginPage";
import { PrivateRoute } from "./components/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import { PublicRoute } from "./components/PublicRroute";
import Index from "./pages/Index";
import { NotesPage } from "./pages/NotesPage";
const queryClient = new QueryClient();

function Bootstrap({ children }) {
  const navigate = useNavigate();
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const sessionRestored = useAuthStore((state) => state.sessionRestored);

  useEffect(() => {
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
                {/* <Route path=":id" element={<NoteDetailPage />} /> */}
              </Route>
            </Route>
          </Routes>
        </Bootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
