import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
