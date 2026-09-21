import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthStore } from "@/store/authStore";
import { Providers } from "./providers";

function Bootstrap({ children }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

function App() {
  return (
    <Bootstrap>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </Bootstrap>
  );
}

export default App;
