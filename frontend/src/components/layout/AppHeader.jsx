import { PanelLeft, Plus, Search, Sparkles } from "lucide-react";
import { Logo } from "../Logo";
import { useUIStore } from "../../store/useUIStore";
import { Button } from "../ui/button";

export function AppHeader() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const aiPanelOpen = useUIStore((state) => state.aiPanelOpen);
  const toggleAiPanel = useUIStore((state) => state.toggleAiPanel);
  const setCmdk = useUIStore((state) => state.setCmdk);
  const newNote = async () => {};

  return (
    <header className="h-12 shrink-0 flex items-center gap-1 px-2 sm:px-3 border-b border-border bg-background/80 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      {/* Brand: always on mobile; on desktop only when sidebar is collapsed */}
      <div
        className={
          sidebarOpen
            ? "flex md:hidden items-center pl-1"
            : "flex items-center pl-1"
        }
      >
        <Logo />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCmdk(true)}
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Search</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={newNote}
          className="h-8 gap-1.5"
          aria-label="New note"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">New</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAiPanel}
          className={`h-8 w-8 ${aiPanelOpen ? "text-primary" : "text-muted-foreground"} hover:text-foreground`}
          aria-label="Toggle AI panel"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
