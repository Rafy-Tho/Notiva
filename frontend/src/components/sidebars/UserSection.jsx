import { Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

export function UserSection() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="border-t border-border p-2">
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent",
            isActive && "bg-sidebar-accent text-foreground",
          )
        }
      >
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px] bg-gradient-primary text-primary-foreground">
            {(user?.name || "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-medium">
            {user?.name || "Guest"}
          </div>
          <div className="truncate text-[10px] text-muted-foreground">
            {user?.email || ""}
          </div>
        </div>
        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
      </NavLink>
    </div>
  );
}
