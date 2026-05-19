import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const sessionRestored = useAuthStore((s) => s.sessionRestored);
  const location = useLocation();
  if (!sessionRestored) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
