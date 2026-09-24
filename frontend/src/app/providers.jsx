import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { setOnUnauthorizedHandler } from "@/lib/fetchWithAuth";
import { useAuthStore } from "@/store/authStore";

// Any 401 from fetchWithAuth permanently expires the session, so clear
// client auth state once instead of reachable through lib.
setOnUnauthorizedHandler(() => useAuthStore.getState().setUser(null));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // fetchWithAuth already owns status-based retries; a second retry
      // layer here would multiply requests (up to 4x) instead of one owner.
      retry: 0,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Sonner position="top-right" />
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
