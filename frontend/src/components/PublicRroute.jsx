// routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function PublicRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const sessionRestored = useAuthStore((s) => s.sessionRestored);

  // Still restoring — don't decide yet
  if (!sessionRestored) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  // Already logged in — go home
  if (accessToken) return <Navigate to="/" replace />;

  return <Outlet />;
}
