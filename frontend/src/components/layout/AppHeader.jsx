import { PanelLeft, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateNoteContext } from "../../hooks/useCreateNoteContext";
import { useCreateNote } from "../../hooks/useNotes";
import { useUIStore } from "../../store/useUIStore";
import { Logo } from "../Logo";
import { Button } from "../ui/button";
import { AvatarImage, Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "../../store/authStore";

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setCmdk = useUIStore((state) => state.setCmdk);

  const { mutateAsync: createNote } = useCreateNote();
  const { defaults, basePath } = useCreateNoteContext();
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const note = await createNote(defaults);
      navigate(`${basePath}/${note.id}`);
      toast.success("Note created");
    } catch (err) {
      toast.error(err.message);
    }
  };

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
          onClick={handleCreate}
          className="h-8 gap-1.5"
          aria-label="New note"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">New</span>
        </Button>
        <Avatar
          className="h-8 w-8 cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          {user?.avatar && (
            <AvatarImage src={user.avatar} alt={user.name || "Avatar"} />
          )}
          {!user?.avatar && (
            <AvatarFallback className="bg-primary/15 text-primary font-semibold text-sm">
              {(user.name || user.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
}
