import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { useTheme } from "../../hooks/useTheme";

function AppLayout() {
  useTheme();
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <AppHeader />
        <div className="flex-1 min-h-0 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
