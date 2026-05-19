import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useLayoutEffect } from "react";
const queryClient = new QueryClient();

function Bootstrap({ children }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useLayoutEffect(() => {
    restoreSession();
  }, []);

  return <>{children}</>;
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Sonner position="top-right" />
      <BrowserRouter>
        <Bootstrap></Bootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
