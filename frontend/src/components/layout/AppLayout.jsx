import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { useTheme } from "@/hooks/useTheme";
import { useUIStore } from "@/store/useUIStore";
import { CommandPalette } from "@/components/common/CommandPalette";

function AppLayout() {
  useTheme();
  const focusMode = useUIStore((s) => s.focusMode);
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {!focusMode && <AppHeader />}
        <div className="flex-1 min-h-0 flex flex-col">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}

export default AppLayout;
