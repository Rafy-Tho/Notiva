import { Hash, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { NavItem } from "./NavItem";

function TagRow({ tag, count, onEdit, onDelete }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <NavItem
            to={`/tags/${tag.id}`}
            icon={Hash}
            iconColor={`hsl(${tag.color})`}
            label={tag.name}
            count={count}
            trailing={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                aria-label="Edit tag"
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
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete tag
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default TagRow;
