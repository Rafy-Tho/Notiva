import { Link, useRouteError } from "react-router-dom";

export function ErrorOverlay() {
  const error = useRouteError();
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : error != null
        ? String(error)
        : "An unexpected error occurred";

  const is404 = error && typeof error === "object" && "status" in error && error.status === 404;

  if (is404) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">404</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
