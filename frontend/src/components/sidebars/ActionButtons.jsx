import { toast } from "sonner";
import { useCreateNoteContext } from "../../hooks/useCreateNoteContext";
import { useCreateNote } from "../../hooks/useNotes";
import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/useUIStore";

export function ActionButtons() {
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
    <div className="px-3 pt-3 flex flex-col gap-1.5">
      <Button
        onClick={handleCreate}
        size="sm"
        className="justify-start gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
      >
        <Plus className="h-4 w-4" /> New note
      </Button>
      <Button
        onClick={() => setCmdk(true)}
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
  );
}
