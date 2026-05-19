import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export function NavItem({ to, icon: Icon, iconColor, label, count, trailing }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
          isActive && "bg-sidebar-accent text-foreground",
        )
      }
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={iconColor ? { color: iconColor } : undefined}
      />
      <span className="flex-1 truncate">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
      {trailing}
    </NavLink>
  );
}
