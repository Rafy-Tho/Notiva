import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthStore } from "@/store/authStore";
import { Providers } from "./providers";
import { Logo } from "@/components/common/Logo";

function Bootstrap({ children }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isRestoring = useAuthStore((state) => state.isRestoring);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isRestoring) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Logo />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          Restoring session…
        </div>
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
