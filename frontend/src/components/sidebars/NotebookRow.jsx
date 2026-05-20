import { BookOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { NavItem } from "./NavItem";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";

function NotebookRow({ notebook, count, onEdit, onDelete }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={"rounded-md transition-colors"}>
          <NavItem
            to={`/notebooks/${notebook.id}`}
            icon={BookOpen}
            iconColor={`hsl(${notebook.color})`}
            label={notebook.name}
            count={count}
            trailing={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                aria-label="Edit notebook"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            }
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 mr-2" /> Rename / recolor
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete notebook
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default NotebookRow;
