import {
  Archive,
  FileText,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "../Logo";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";
import { Sheet, SheetContent } from "../ui/sheet";
import { useUIStore } from "../../store/useUIStore";
import { Section, SectionHeader } from "../sidebar-com/Section";
import { NavItem } from "../sidebar-com/NavItem";
import NotebookRow from "../sidebar-com/NotebookRow";
import TagRow from "../sidebar-com/TagRow";
import { useAuthStore } from "../../store/authStore";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import NameColorForm from "../sidebar-com/NameColorForm";
const notebooks = [
  {
    id: 1,
    name: "Personal",
    color: "245 80% 66%",
    createdAt: Date.now(),
  },
  { id: 1, name: "Work", color: "200 80% 60%", createdAt: Date.now() },
  { id: 1, name: "Ideas", color: "38 92% 60%", createdAt: Date.now() },
];
const tags = [
  {
    id: 1,
    name: "Personal",
    color: "245 80% 66%",
    createdAt: Date.now(),
  },
  { id: 1, name: "Work", color: "200 80% 60%", createdAt: Date.now() },
  { id: 1, name: "Ideas", color: "38 92% 60%", createdAt: Date.now() },
];
const COLORS = [
  "245 80% 66%",
  "200 80% 60%",
  "38 92% 60%",
  "142 65% 50%",
  "0 70% 60%",
  "280 70% 65%",
];
export function Sidebar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebar = useUIStore((state) => state.setSidebar);
  const user = useAuthStore((s) => s.user);

  const createNotebook = () => {};
  const inner = (
    <>
      <div className="flex h-12 items-center justify-between px-3 border-b border-border">
        <Logo />
      </div>

      <div className="px-3 pt-3 flex flex-col gap-1.5">
        <Button
          onClick={() => {}}
          size="sm"
          className="justify-start gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
        >
          <Plus className="h-4 w-4" /> New note
        </Button>
        <Button
          onClick={() => {}}
          variant="outline"
          size="sm"
          className="justify-between gap-2 bg-background/40"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Search
          </span>
          <kbd className="hidden lg:inline text-[10px] font-mono text-muted-foreground border border-border rounded px-1">
            ⌘K
          </kbd>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        <Section>
          <NavItem to="/notes" icon={FileText} label="All notes" count={3} />
          <NavItem to="/favorites" icon={Star} label="Favorites" count={4} />
          <NavItem to="/archive" icon={Archive} label="Archive" count={5} />
          <NavItem to="/trash" icon={Trash2} label="Trash" count={10} />
        </Section>

        <SectionHeader
          label="Notebooks"
          action={
            <button
              onClick={() => {
                setName("");
                setColor(COLORS[0]);
                setCreateOpen(true);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        />
        <Section>
          {notebooks.map((nb) => (
            <NotebookRow
              key={nb.id}
              notebook={nb}
              count={6}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
          {notebooks.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No notebooks yet
            </div>
          )}
        </Section>

        <SectionHeader
          label="Tags"
          action={
            <button
              onClick={() => {}}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        />
        <Section>
          {tags.slice(0, 12).map((t) => (
            <TagRow
              key={t.id}
              tag={t}
              count={9}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
          {tags.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No tags yet
            </div>
          )}
        </Section>
      </nav>

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

      {/* Create notebook */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New notebook</DialogTitle>
          </DialogHeader>
          <NameColorForm
            name={name}
            setName={setName}
            color={color}
            setColor={setColor}
            placeholder="e.g. Research"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNotebook}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit notebook */}
      {/* <Dialog
        open={!!editNotebook}
        onOpenChange={(o) => !o && setEditNotebook(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit notebook</DialogTitle>
          </DialogHeader>
          {editNotebook && (
            <EditNotebookForm
              notebook={editNotebook}
              onClose={() => setEditNotebook(null)}
              onSaved={() => qc.invalidateQueries({ queryKey: ["notebooks"] })}
            />
          )}
        </DialogContent>
      </Dialog> */}

      {/* Delete notebook */}
      {/* <DeleteNotebookDialog
        notebook={deleteNotebook}
        onClose={() => setDeleteNotebook(null)}
      /> */}

      {/* Create tag */}
      {/* <Dialog open={tagCreateOpen} onOpenChange={setTagCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New tag</DialogTitle>
          </DialogHeader>
          <NameColorForm
            name={name}
            setName={setName}
            color={color}
            setColor={setColor}
            placeholder="e.g. ideas"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTagCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTag}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Edit tag */}
      {/* <Dialog open={!!editTag} onOpenChange={(o) => !o && setEditTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit tag</DialogTitle>
          </DialogHeader>
          {editTag && (
            <EditTagForm
              tag={editTag}
              onClose={() => setEditTag(null)}
              onSaved={() => qc.invalidateQueries({ queryKey: ["tags"] })}
            />
          )}
        </DialogContent>
      </Dialog> */}

      {/* Delete tag */}
      {/* <Dialog open={!!deleteTag} onOpenChange={(o) => !o && setDeleteTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag “{deleteTag?.name}”?</DialogTitle>
            <DialogDescription>
              The tag will be removed from all notes. The notes themselves are
              kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTag(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTag) return;
                await tagsApi.remove(deleteTag.id);
                qc.invalidateQueries({ queryKey: ["tags"] });
                qc.invalidateQueries({ queryKey: ["notes"] });
                qc.invalidateQueries({ queryKey: ["sidebar-counts"] });
                toast.success("Tag deleted");
                setDeleteTag(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebar}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar flex flex-col">
          {inner}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out overflow-hidden",
        sidebarOpen ? "w-60" : "w-0 border-r-0",
      )}
    >
      <div
        className={cn("flex flex-col h-full w-60", !sidebarOpen && "invisible")}
      >
        {inner}
      </div>
    </aside>
  );
}
